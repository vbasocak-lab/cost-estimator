import { resolveConfidence } from "./confidence";
import { LOT_PRICES } from "./lot-prices";
import { getBaseActiveLots, getDefaultQuantity, uniqueLots } from "./quantity-defaults";
import { RULES } from "./rules";
import type {
  ConfidenceLevel,
  EstimateResult,
  LotCalculation,
  LotCode,
  ProjectInput,
  Rule,
  RuleCondition,
} from "./types";

export const DEFAULT_FRAIS_GENERAUX_RATE = 0.05;
export const DEFAULT_MARGE_RATE = 0.08;
export const DEFAULT_TVA_RATE = 0.2;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function conditionMatches(
  project: ProjectInput,
  condition: RuleCondition,
  context?: { requiredLotsCompletedPct?: number }
): boolean {
  if (condition.region !== undefined && project.region !== condition.region) return false;
  if (condition.country !== undefined && project.country !== condition.country) return false;
  if (condition.project_type !== undefined && project.project_type !== condition.project_type) return false;
  if (condition.project_type_in !== undefined && !condition.project_type_in.includes(project.project_type)) return false;
  if (condition.finish_level !== undefined && project.finish_level !== condition.finish_level) return false;
  if (condition.energy_package !== undefined && project.energy_package !== condition.energy_package) return false;
  if (condition.has_basement !== undefined && project.has_basement !== condition.has_basement) return false;
  if (condition.floors_gte !== undefined && project.floors < condition.floors_gte) return false;
  if (condition.heated_area_m2_gt !== undefined && project.heated_area_m2 <= condition.heated_area_m2_gt) return false;
  if (condition.bathroom_count_gt !== undefined && project.bathroom_count <= condition.bathroom_count_gt) return false;
  if (condition.kitchen !== undefined && project.kitchen !== condition.kitchen) return false;
  if (condition.surface_m2_lt !== undefined && project.surface_m2 >= condition.surface_m2_lt) return false;
  if (condition.surface_m2_gt !== undefined && project.surface_m2 <= condition.surface_m2_gt) return false;
  if (condition.site_access !== undefined && project.site_access !== condition.site_access) return false;
  if (
    condition.required_lots_completed_pct_gte !== undefined &&
    (context?.requiredLotsCompletedPct ?? 0) < condition.required_lots_completed_pct_gte
  ) return false;
  return true;
}

export function estimateProject(project: ProjectInput, rules: Rule[] = RULES): EstimateResult {
  const warnings: string[] = [];
  const appliedRules = [...rules].sort((left, right) => left.priority - right.priority);

  let regionCoef = 1;
  let globalCoef = 1;
  let contingencyRate = 0;
  const requiredLots: LotCode[] = [];
  let activeLots: LotCode[] = getBaseActiveLots(project);
  const lotCoefs: Partial<Record<LotCode, number>> = {};
  let confidence: ConfidenceLevel = "Bas";

  for (const rule of appliedRules) {
    if (!conditionMatches(project, rule.condition)) continue;

    if (rule.action.set_region_coef !== undefined) {
      regionCoef = rule.action.set_region_coef;
    }
    if (rule.action.require_lots) {
      requiredLots.push(...rule.action.require_lots);
    }
    if (rule.action.require_one_of_lots) {
      const alreadyActive = rule.action.require_one_of_lots.some((lotCode) => activeLots.includes(lotCode));
      if (!alreadyActive) requiredLots.push(rule.action.require_one_of_lots[0]);
    }
    if (rule.action.activate_lots) {
      activeLots.push(...rule.action.activate_lots);
    }
    if (rule.action.increase_contingency !== undefined) {
      contingencyRate = Math.max(contingencyRate, rule.action.increase_contingency);
    }
    if (rule.action.increase_coef) {
      for (const [lotCode, coefficient] of Object.entries(rule.action.increase_coef) as Array<[LotCode, number]>) {
        lotCoefs[lotCode] = (lotCoefs[lotCode] ?? 1) * coefficient;
      }
    }
    if (rule.action.increase_global_coef !== undefined) {
      globalCoef *= rule.action.increase_global_coef;
    }
    if (rule.action.decrease_global_coef !== undefined) {
      globalCoef *= 1 - rule.action.decrease_global_coef;
    }
    if (rule.action.require_selection?.includes("energy_package") && project.energy_package === "none") {
      warnings.push("Energy package secilmemis. RE2020 icin energy_package gerekli.");
    }
    if (rule.action.set_confidence) {
      confidence = rule.action.set_confidence;
    }
  }

  const requiredUnique = uniqueLots(requiredLots);
  const activeUnique = uniqueLots(activeLots);
  const missingRequiredLots = requiredUnique.filter((lotCode) => !activeUnique.includes(lotCode));

  if (missingRequiredLots.length > 0) {
    warnings.push(`Eksik zorunlu lotlar: ${missingRequiredLots.join(", ")}`);
  }

  const completedPct = requiredUnique.length === 0
    ? 100
    : ((requiredUnique.length - missingRequiredLots.length) / requiredUnique.length) * 100;

  confidence = resolveConfidence(rules, warnings, completedPct, confidence);

  const breakdown: LotCalculation[] = [];
  let sousTotalTravauxHT = 0;

  for (const lotCode of activeUnique) {
    const meta = LOT_PRICES[lotCode];
    if (!meta) {
      warnings.push(`Lot price tanimi eksik: ${lotCode}`);
      continue;
    }

    const quantity = getDefaultQuantity(project, lotCode, meta.unit);
    if (quantity <= 0) continue;

    const lotCoef = lotCoefs[lotCode] ?? 1;
    const adjustedPriceHT = meta.base_price_ht * lotCoef * regionCoef * globalCoef;
    const totalHT = quantity * adjustedPriceHT;

    breakdown.push({
      lot_code: lotCode,
      label: meta.label,
      unit: meta.unit,
      quantity: round2(quantity),
      base_price_ht: round2(meta.base_price_ht),
      adjusted_price_ht: round2(adjustedPriceHT),
      total_ht: round2(totalHT),
      active: true,
    });

    sousTotalTravauxHT += totalHT;
  }

  breakdown.sort((left, right) => right.total_ht - left.total_ht);

  const fraisGenerauxHT = sousTotalTravauxHT * DEFAULT_FRAIS_GENERAUX_RATE;
  const contingencyHT = sousTotalTravauxHT * contingencyRate;
  const margeHT = sousTotalTravauxHT * DEFAULT_MARGE_RATE;
  const totalHT = sousTotalTravauxHT + fraisGenerauxHT + contingencyHT + margeHT;
  const tva = totalHT * DEFAULT_TVA_RATE;
  const totalTTC = totalHT + tva;

  return {
    project_name: project.name,
    confidence,
    required_lots: requiredUnique,
    active_lots: activeUnique,
    missing_required_lots: missingRequiredLots,
    region_coef: round2(regionCoef),
    global_coef: round2(globalCoef),
    contingency_rate: round2(contingencyRate),
    frais_generaux_rate: DEFAULT_FRAIS_GENERAUX_RATE,
    marge_rate: DEFAULT_MARGE_RATE,
    tva_rate: DEFAULT_TVA_RATE,
    sous_total_travaux_ht: round2(sousTotalTravauxHT),
    contingency_ht: round2(contingencyHT),
    frais_generaux_ht: round2(fraisGenerauxHT),
    marge_ht: round2(margeHT),
    total_ht: round2(totalHT),
    tva: round2(tva),
    total_ttc: round2(totalTTC),
    breakdown,
    warnings,
  };
}
