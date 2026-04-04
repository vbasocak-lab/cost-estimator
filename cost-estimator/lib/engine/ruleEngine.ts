import { ProjectVersionInput } from "./types";

// ─── DB rule shape ────────────────────────────────────────────────────────────

interface LegacyRuleCondition {
  fieldName: string;
  operator: string;
  compareValue: string;
}

interface RuleFromDB {
  ruleCode: string;
  ruleType: string;
  conditionJson: string | null;
  actionJson: string | null;
  outputTarget: string | null;
  conditions: LegacyRuleCondition[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Regions considered "major city" in France
const MAJOR_CITY_REGIONS = ["IDF", "ARA", "PACA", "HDF", "OCC"];

/** Returns the set of project-type strings that the current input matches. */
function normalizeProjectTypes(input: ProjectVersionInput): string[] {
  const t: string[] = [];
  if (input.projectTypeCode === "new_build")  t.push("new_build");
  if (input.projectTypeCode === "extension")  t.push("extension");
  if (input.projectTypeCode === "renovation") {
    t.push("renovation");
    const scope = input.renovationScopeCode ?? "light";
    if (scope === "light")    t.push("light_renovation");
    if (scope === "complete") t.push("light_renovation", "heavy_renovation");
    if (scope === "heavy")    t.push("heavy_renovation");
  }
  return t;
}

// ─── New JSON Condition evaluator ─────────────────────────────────────────────

function evalConditionJson(
  cond: Record<string, unknown>,
  input: ProjectVersionInput
): boolean {
  const projectTypes = normalizeProjectTypes(input);

  for (const [key, value] of Object.entries(cond)) {
    switch (key) {
      case "region":
        if (input.regionCode !== value) return false;
        break;

      case "region_type":
        if (value === "major_city" && !MAJOR_CITY_REGIONS.includes(input.regionCode))
          return false;
        break;

      case "project_type":
        if (!projectTypes.includes(value as string)) return false;
        break;

      case "project_type_in":
        if (!(value as string[]).some((t) => projectTypes.includes(t))) return false;
        break;

      case "building_age":
        if (value === "pre_1948" && input.buildingAge !== "pre_1948") return false;
        break;

      case "heated_area_m2_gt":
        if ((input.grossAreaM2 ?? 0) <= (value as number)) return false;
        break;

      case "bathroom_count_gt":
        if ((input.bathroomCount ?? 0) <= (value as number)) return false;
        break;

      case "kitchen":
        if (value === true && !input.hasKitchen) return false;
        break;

      case "has_basement":
        if (value === true && (input.floorsBelowGround ?? 0) <= 0) return false;
        break;

      case "floors_gte":
        if (input.floorsAboveGround < (value as number)) return false;
        break;

      case "country":
        if (input.countryCode && input.countryCode !== value) return false;
        break;

      case "energy_package":
        if (input.energyPackage !== value) return false;
        break;

      case "finish_level":
        if (input.finishLevelCode !== value) return false;
        break;

      case "surface_m2_lt":
        if ((input.grossAreaM2 ?? 0) >= (value as number)) return false;
        break;
      case "surface_m2_gte":
        if ((input.grossAreaM2 ?? 0) < (value as number)) return false;
        break;
      case "surface_m2_lte":
        if ((input.grossAreaM2 ?? 0) > (value as number)) return false;
        break;
      case "surface_m2_gt":
        if ((input.grossAreaM2 ?? 0) <= (value as number)) return false;
        break;

      case "site_access":
        if (input.siteAccess !== value) return false;
        break;

      // Confidence-specific keys — evaluated in determineConfidence, not here
      case "required_lots_completed_pct_gte":
      case "project_inputs_completed_pct_gte":
      case "technical_lots_present":
        break;

      default:
        break;
    }
  }
  return true;
}

// ─── Legacy condition evaluator ───────────────────────────────────────────────

function evalLegacyCondition(
  condition: LegacyRuleCondition,
  input: ProjectVersionInput
): boolean {
  const fieldMap: Record<string, string | number | boolean> = {
    floorsAboveGround: input.floorsAboveGround,
    floorsBelowGround: input.floorsBelowGround,
    projectType: input.projectTypeCode,
    renovationScope: input.renovationScopeCode ?? "",
    finishLevel: input.finishLevelCode,
    regionCode: input.regionCode,
    energyStandard: input.energyStandardCode ?? "",
    heatingType: input.heatingType,
  };
  const v = fieldMap[condition.fieldName];
  const cv = condition.compareValue;
  switch (condition.operator) {
    case "eq":  return String(v) === cv;
    case "neq": return String(v) !== cv;
    case "gte": return Number(v) >= Number(cv);
    case "lte": return Number(v) <= Number(cv);
    case "gt":  return Number(v) > Number(cv);
    case "lt":  return Number(v) < Number(cv);
    case "in":  return cv.split(",").includes(String(v));
    default:    return false;
  }
}

// ─── Action parser ────────────────────────────────────────────────────────────

export interface RuleEffects {
  activateLots: string[];
  deactivateLots: string[];
  requireLots: string[];
  requireOneOfLots: string[][];
  /** Accumulated per-lot multipliers (compound across rules) */
  lotCoefficientOverrides: Record<string, number>;
  contingencyUplift: number;
  /** Multiplicative global cost modifier (default 1.0) */
  globalCoefficientMultiplier: number;
  confidenceOverride: "indicatif" | "affine" | "avance" | null;
  warnings: string[];
}

function applyActionJson(
  ruleCode: string,
  act: Record<string, unknown>,
  effects: RuleEffects
): void {
  for (const [key, value] of Object.entries(act)) {
    switch (key) {
      case "activate_lots":
        (value as string[]).forEach((c) => effects.activateLots.push(c));
        break;

      case "deactivate_lots":
        (value as string[]).forEach((c) => effects.deactivateLots.push(c));
        break;

      case "require_lots":
        (value as string[]).forEach((c) => {
          effects.requireLots.push(c);
          effects.activateLots.push(c); // requiring also activates
        });
        break;

      case "require_one_of_lots":
        effects.requireOneOfLots.push(value as string[]);
        break;

      case "require_selection":
        effects.warnings.push(
          `${ruleCode}: selection required for "${(value as string[]).join(", ")}"`
        );
        break;

      case "increase_coef": {
        const coefMap = value as Record<string, number>;
        for (const [lotCode, factor] of Object.entries(coefMap)) {
          if (Number.isFinite(factor) && factor > 0) {
            effects.lotCoefficientOverrides[lotCode] =
              (effects.lotCoefficientOverrides[lotCode] ?? 1.0) * factor;
          }
        }
        break;
      }

      case "increase_contingency":
        if (Number.isFinite(value as number)) effects.contingencyUplift += value as number;
        break;

      case "increase_global_coef":
        if (Number.isFinite(value as number)) effects.globalCoefficientMultiplier *= value as number;
        break;

      case "decrease_global_coef":
        if (Number.isFinite(value as number))
          effects.globalCoefficientMultiplier *= 1 - (value as number);
        break;

      case "set_region_coef":
        effects.warnings.push(
          `${ruleCode}: regional coef set to ${value} (applied via RegionalCoefficients table)`
        );
        break;

      case "set_confidence": {
        const s = String(value).toLowerCase();
        effects.confidenceOverride =
          s === "avance" || s === "avancé" ? "avance" :
          s === "moyen" || s === "affine"  ? "affine"  :
                                              "indicatif";
        break;
      }

      case "apply_on":
        // informational — no computation needed
        break;

      default:
        break;
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function applyRules(rules: RuleFromDB[], input: ProjectVersionInput): RuleEffects {
  const effects: RuleEffects = {
    activateLots: [],
    deactivateLots: [],
    requireLots: [],
    requireOneOfLots: [],
    lotCoefficientOverrides: {},
    contingencyUplift: 0,
    globalCoefficientMultiplier: 1.0,
    confidenceOverride: null,
    warnings: [],
  };

  for (const rule of rules) {
    // ── Evaluate conditions ──────────────────────────────────────────────────
    let matched: boolean;

    if (rule.conditionJson) {
      try {
        const cond = JSON.parse(rule.conditionJson) as Record<string, unknown>;
        // Empty condition object = default rule (always matches)
        matched = Object.keys(cond).length === 0 ? true : evalConditionJson(cond, input);
      } catch {
        continue;
      }
    } else if (rule.conditions.length > 0) {
      matched = rule.conditions.every((c) => evalLegacyCondition(c, input));
    } else {
      matched = true; // no conditions = always applies
    }

    if (!matched) continue;

    // ── Apply actions ────────────────────────────────────────────────────────
    if (rule.actionJson) {
      try {
        const act = JSON.parse(rule.actionJson) as Record<string, unknown>;
        applyActionJson(rule.ruleCode, act, effects);
      } catch {
        continue;
      }
    } else if (rule.outputTarget) {
      // Legacy outputTarget string format
      const output = rule.outputTarget;
      if (output.startsWith("activate_lot:"))
        effects.activateLots.push(output.slice("activate_lot:".length));
      else if (output.startsWith("deactivate_lot:"))
        effects.deactivateLots.push(output.slice("deactivate_lot:".length));
      else if (output.startsWith("increase_coef:")) {
        const parts = output.split(":");
        const factor = parseFloat(parts[2]);
        if (parts[1] && Number.isFinite(factor) && factor > 0)
          effects.lotCoefficientOverrides[parts[1]] =
            (effects.lotCoefficientOverrides[parts[1]] ?? 1.0) * factor;
      } else if (output.startsWith("increase_contingency:")) {
        const uplift = parseFloat(output.split(":")[1]);
        if (Number.isFinite(uplift)) effects.contingencyUplift += uplift;
      } else if (output.startsWith("set_region_coef:")) {
        effects.warnings.push(`${rule.ruleCode}: region coef override (${output})`);
      } else if (output.startsWith("require_selection:")) {
        effects.warnings.push(
          `${rule.ruleCode}: selection required for "${output.slice("require_selection:".length)}"`
        );
      }
    }
  }

  return effects;
}
