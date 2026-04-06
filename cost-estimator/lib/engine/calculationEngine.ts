import { prisma } from "@/lib/db/prisma";
import { applyRules } from "./ruleEngine";
import { resolveQuantity } from "./quantityResolver";
import { buildCoefficientSet } from "./coefficientApplier";
import { ProjectVersionInput, EngineResult, CalculatedLot } from "./types";
import { generateActiveCodeList, MappingInput } from "./mapping-engine";
import { resolveByCodePrefix } from "./quantity-resolver";

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
  // 1. Load all active lots
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

  // 4. Build MappingInput — use actual input fields, never hardcoded defaults
  const mappingInput: MappingInput = {
    surfaceShonM2: input.grossAreaM2,
    surfaceShabM2: input.netAreaM2,
    aboveGroundFloors: input.floorsAboveGround,
    basementFloors: input.floorsBelowGround,
    buildingUsage: input.projectTypeCode === "new_build" ? "single_family" : "renovation",
    structureType: input.structureType ?? "concrete",
    facadeComplexity: input.facadeComplexity,
    roofType: input.roofType ?? "pitched",
    energyStandard: input.energyStandardCode ?? "re2020",
    heatingSystem: input.heatingType ?? "gas",
    heatingDistribution: input.heatingDistribution ?? "radiators",
    ventilationType: input.ventilationType ?? "simple",
    electricLevel: input.electricLevel ?? "standard",
    elevatorRequired: input.hasElevator || input.floorsAboveGround >= 4,
    windowGlazingType: input.windowGlazingType ?? "double",
    windowFrameType: input.windowFrameType ?? "pvc",
    windowOpeningType: input.windowOpeningType ?? "casement",
    windowAreaRatio: input.windowAreaRatio ?? 0.15,
    roofWindowCount: input.roofWindowCount ?? 0,
    interiorDoorCount: input.interiorDoorCount ?? Math.max(1, Math.floor(input.netAreaM2 / 20)),
    interiorDoorType: input.interiorDoorType ?? "standard",
    hasStair: input.hasStair ?? input.floorsAboveGround > 1,
    stairType: input.stairType ?? "straight",
    stairFinish: input.stairFinish ?? "wood",
    bathroomCount: input.bathroomCount ?? 1,
    bathroomLevel: input.bathroomLevel ?? "standard",
    bathroomType: input.bathroomType ?? "shower",
    wcCount: input.wcCount ?? 1,
    wcType: input.wcType ?? "suspended",
    showerType: input.showerType ?? "standard",
    vanityType: input.vanityType ?? "standard",
    bathtubType: input.bathtubType ?? "standard",
    kitchenType: input.kitchenType ?? "standard",
    kitchenCredenceType: input.kitchenCredenceType ?? "tile",
    hasBuanderie: input.hasBuanderie ?? false,
    hasCellier: input.hasCellier ?? false,
    cellierStorageLevel: input.cellierStorageLevel ?? "none",
    finishLevel: input.finishLevel ?? input.finishLevelCode ?? "standard",
  };

  // 5. Get dynamic lot activations from mapping engine
  const lotActivations = await generateActiveCodeList(mappingInput, prisma);

  // Build O(1) lookup for lot activations
  const activationByLot = new Map(lotActivations.map((a) => [a.lotCode, a]));
  const activeLotCodes = new Set(lotActivations.map((a) => a.lotCode));

  // Apply rule effects
  ruleEffects.activateLots.forEach((c) => activeLotCodes.add(c));
  ruleEffects.deactivateLots.forEach((c) => activeLotCodes.delete(c));

  // Elevator activation (rule or explicit flag)
  if (input.hasElevator || input.floorsAboveGround >= 4) {
    activeLotCodes.add("ascenseur");
  }

  // 6. Batch-load all price items needed (single query, O(1) lookup)
  const allArticleCodes = lotActivations.flatMap((a) => a.articleCodes);
  const priceItemRows = await prisma.priceItem.findMany({
    where: { itemCode: { in: allArticleCodes }, isActive: true },
  });
  const priceItemByCode = new Map(priceItemRows.map((p) => [p.itemCode, p]));

  // 7. Calculate each active lot
  const calculatedLots: CalculatedLot[] = [];
  const quantityParams = {
    surfaceShonM2: input.grossAreaM2,
    surfaceShabM2: input.netAreaM2,
    bathroomCount: input.bathroomCount ?? 1,
    wcCount: input.wcCount ?? 1,
    bedroomCount: input.bedroomCount ?? 2,
    roomCount: Math.max(1, Math.floor(input.netAreaM2 / 20)),
    interiorDoorCount: input.interiorDoorCount ?? Math.max(1, Math.floor(input.netAreaM2 / 20)),
    aboveGroundFloors: input.floorsAboveGround,
    basementFloors: input.floorsBelowGround,
  };

  for (const lot of lots) {
    if (!activeLotCodes.has(lot.code)) continue;

    const label =
      lot.translations.find((t) => t.languageCode === "fr")?.label ?? lot.code;

    const activation = activationByLot.get(lot.code);
    const articleCodes = activation?.articleCodes ?? [];
    const quantities = activation?.quantities ?? {};

    let lotTotalHt = 0;
    let totalQuantityUsed = 0;
    let lotCoefficients = { regional: 1, quality: 1, complexity: 1, renovation: 1, index: 1 };
    let hasArticles = false;

    for (const articleCode of articleCodes) {
      const priceItem = priceItemByCode.get(articleCode);
      if (!priceItem) continue;

      hasArticles = true;
      const quantity = quantities[articleCode] ?? resolveByCodePrefix(articleCode, quantityParams);

      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      const coefficients = buildCoefficientSet(lot.id, input, coeffData);
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

      if (!Number.isFinite(lineTotalHt)) continue;

      lotTotalHt += lineTotalHt;
      totalQuantityUsed += quantity;
      lotCoefficients = coefficients;
    }

    if (hasArticles && lotTotalHt > 0 && totalQuantityUsed > 0) {
      calculatedLots.push({
        lotId: lot.id,
        lotCode: lot.code,
        lotLabel: label,
        quantity: totalQuantityUsed,
        unit: lot.defaultUnit,
        unitPriceHt: lotTotalHt / totalQuantityUsed,
        lineTotalHt: lotTotalHt,
        coefficients: lotCoefficients,
        isActive: true,
      });
    } else {
      // Fallback: legacy calculation for lots not covered by mapping engine
      const priceItem = lot.priceItems[0];
      if (!priceItem) continue;

      const quantity = resolveQuantity(lot.code, lot.defaultUnit, input);
      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      const coefficients = buildCoefficientSet(lot.id, input, coeffData);
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
  }

  // 8. Aggregate
  const baseTotalHt = calculatedLots.reduce((sum, l) => sum + l.lineTotalHt, 0);
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
