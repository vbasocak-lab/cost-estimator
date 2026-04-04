import { prisma } from "@/lib/db/prisma";
import { applyRules } from "./ruleEngine";
import { resolveQuantity } from "./quantityResolver";
import { buildCoefficientSet } from "./coefficientApplier";
import { ProjectVersionInput, EngineResult, CalculatedLot } from "./types";

// Returns the default active lot codes for a given project type + renovation scope
function getDefaultActiveLots(
  projectTypeCode: string,
  renovationScopeCode?: string
): string[] {
  const newBuild = [
    "terrassement", "fondations", "gros_oeuvre_structure", "charpente",
    "couverture", "menuiseries_ext", "isolation", "cloisons",
    "revetements", "peinture", "menuiseries_int", "plomberie",
    "electricite", "chauffage_ventilation", "vrd",
  ];

  if (projectTypeCode === "new_build" || projectTypeCode === "extension") {
    return newBuild;
  }

  if (projectTypeCode === "renovation") {
    const base = [
      "cloisons", "revetements", "peinture", "menuiseries_int",
      "menuiseries_ext", "isolation", "plomberie", "electricite",
      "chauffage_ventilation",
    ];
    if (renovationScopeCode === "complete") {
      return [...base, "charpente", "couverture", "gros_oeuvre_structure"];
    }
    if (renovationScopeCode === "heavy") {
      // Heavy renovation adds earthworks, foundations and site works
      return [...base, "charpente", "couverture", "gros_oeuvre_structure",
               "terrassement", "fondations", "vrd"];
    }
    return base; // light renovation
  }

  return newBuild;
}

function determineConfidence(input: ProjectVersionInput): "indicatif" | "affine" | "avance" {
  let score = 0;
  if (input.grossAreaM2 > 0) score++;
  if (input.netAreaM2 > 0) score++;
  if (input.regionCode) score++;
  if (input.finishLevelCode) score++;
  if (input.projectTypeCode) score++;
  if (input.energyStandardCode) score++;
  if (input.heatingType && input.heatingType !== "gas") score++;

  if (score <= 3) return "indicatif";
  if (score <= 5) return "affine";
  return "avance";
}

export async function runCalculation(input: ProjectVersionInput): Promise<EngineResult> {
  // 1. Load all active lots with their cheapest active price item
  const lots = await prisma.costLot.findMany({
    where: { isActive: true },
    include: {
      translations: true,
      priceItems: {
        where: { isActive: true, validTo: null },
        orderBy: { basePriceHt: "asc" },
        take: 1,
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // 2. Load coefficient tables
  const [regionalCoefficients, qualityCoefficients, complexityCoefficients, renovationScopes] =
    await Promise.all([
      prisma.regionalCoefficient.findMany({
        include: { region: { select: { code: true } } },
      }),
      prisma.qualityCoefficient.findMany({
        include: { finishLevel: { select: { code: true } } },
      }),
      prisma.complexityCoefficient.findMany(),
      prisma.renovationScope.findMany(),
    ]);

  const coeffData = { regionalCoefficients, qualityCoefficients, complexityCoefficients, renovationScopes };

  // 3. Evaluate rules
  const rules = await prisma.calculationRule.findMany({
    where: { isActive: true },
    include: { conditions: true },
    orderBy: { priority: "asc" },
  });

  const ruleEffects = applyRules(rules, input);

  // 4. Build active lot set
  const activeLotCodes = new Set(
    getDefaultActiveLots(input.projectTypeCode, input.renovationScopeCode)
  );
  ruleEffects.activateLots.forEach((c) => activeLotCodes.add(c));
  ruleEffects.deactivateLots.forEach((c) => activeLotCodes.delete(c));

  // Elevator activation (rule or explicit flag)
  if (input.hasElevator || input.floorsAboveGround >= 4) {
    activeLotCodes.add("ascenseur");
  }

  // 5. Calculate each active lot
  const calculatedLots: CalculatedLot[] = [];

  for (const lot of lots) {
    if (!activeLotCodes.has(lot.code)) continue;

    const label =
      lot.translations.find((t) => t.languageCode === "fr")?.label ?? lot.code;

    const priceItem = lot.priceItems[0];
    if (!priceItem) continue; // skip lots with no price data

    const quantity = resolveQuantity(lot.code, lot.defaultUnit, input);

    // Quantity must be positive and finite to avoid NaN propagation
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const coefficients = buildCoefficientSet(lot.id, input, coeffData);

    // Rule-based lot coefficient override (accumulated, not replaced — handled in ruleEngine)
    const ruleCoef = ruleEffects.lotCoefficientOverrides[lot.code] ?? 1.0;

    const totalCoef =
      coefficients.regional *
      coefficients.quality *
      coefficients.complexity *
      coefficients.renovation *
      coefficients.index *
      ruleCoef;

    const unitPriceHt = priceItem.basePriceHt * totalCoef;
    const lineTotalHt = quantity * unitPriceHt;

    // Guard against NaN / Infinity from bad price data
    if (!Number.isFinite(lineTotalHt)) continue;

    calculatedLots.push({
      lotId: lot.id,
      lotCode: lot.code,
      lotLabel: label,
      quantity,
      unit: lot.defaultUnit,
      unitPriceHt,
      lineTotalHt,
      coefficients,
      isActive: true,
    });
  }

  // 6. Aggregate
  const baseTotalHt = calculatedLots.reduce((sum, l) => sum + l.lineTotalHt, 0);

  // Apply global coefficient from rules (surface scale, etc.)
  const adjustedBaseHt = baseTotalHt * ruleEffects.globalCoefficientMultiplier;

  const contingencyRate = input.contingencyRate + ruleEffects.contingencyUplift;
  const contingencyAmount = adjustedBaseHt * contingencyRate;
  const overheadAmount = adjustedBaseHt * input.overheadRate;
  const profitAmount = adjustedBaseHt * input.profitRate;

  const totalCostHt = adjustedBaseHt + contingencyAmount + overheadAmount + profitAmount;
  const totalCostTva = totalCostHt * input.vatRate;
  const totalCostTtc = totalCostHt + totalCostTva;

  const area = input.grossAreaM2 > 0 ? input.grossAreaM2 : 1;
  const costPerM2Ht = totalCostHt / area;
  const costPerM2Ttc = totalCostTtc / area;

  // Confidence: rule override takes priority, otherwise auto-determine
  const confidenceLevel = ruleEffects.confidenceOverride ?? determineConfidence(input);

  return {
    lots: calculatedLots,
    totalCostHt,
    totalCostTva,
    totalCostTtc,
    costPerM2Ht,
    costPerM2Ttc,
    contingencyAmount,
    overheadAmount,
    profitAmount,
    confidenceLevel,
    sensitivityLow: totalCostHt * 0.85,
    sensitivityHigh: totalCostHt * 1.15,
    warnings: ruleEffects.warnings,
  };
}
