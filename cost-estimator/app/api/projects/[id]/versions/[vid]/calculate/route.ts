import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runCalculation } from "@/lib/engine/calculationEngine";
import { ProjectVersionInput } from "@/lib/engine/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, vid } = await params;

  // Ownership: verify project belongs to session user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerUserId: true },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const version = await prisma.projectVersion.findUnique({
    where: { id: vid, projectId }, // projectId guard prevents cross-project access
    include: {
      project: {
        include: { country: true, region: true, projectType: true },
      },
      finishLevelRef: true,
      renovationScope: true,
      energyStandardRef: true,
    },
  });

  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const engineInput: ProjectVersionInput = {
    id: version.id,
    projectId: version.projectId,
    grossAreaM2: version.grossAreaM2,
    netAreaM2: version.netAreaM2,
    floorsAboveGround: version.floorsAboveGround,
    floorsBelowGround: version.floorsBelowGround,
    facadeComplexity: version.facadeComplexity,
    finishLevelCode: version.finishLevelRef?.code ?? version.finishLevel ?? "standard",
    finishLevel: version.finishLevel ?? "standard",
    regionCode: version.project.region?.code ?? "OCC",
    countryCode: version.project.country?.code ?? "FR",
    projectTypeCode: version.project.projectType?.code ?? "new_build",
    renovationScopeCode: version.renovationScope?.code,
    energyStandardCode: version.energyStandardRef?.code ?? version.energyStandard,
    energyPackage: version.energyPackage ?? undefined,
    heatingType: version.heatingType,
    heatingDistribution: version.heatingDistribution ?? "radiators",
    ventilationType: version.ventilationType,
    hasElevator: version.hasElevator,
    contingencyRate: version.contingencyRate,
    overheadRate: version.overheadRate,
    profitRate: version.profitRate,
    vatRate: version.vatRate,
    siteAccess: version.siteAccess ?? undefined,
    bathroomCount: version.bathroomCount ?? 1,
    wcCount: version.wcCount ?? 1,
    bedroomCount: version.bedroomCount ?? 2,
    hasKitchen: true,
    buildingAge: version.buildingAge ?? undefined,
    // Dynamic configurator fields
    structureType: version.structureType ?? "concrete",
    roofType: version.roofType ?? "pitched",
    electricLevel: version.electricLevel ?? "standard",
    windowGlazingType: version.windowGlazingType ?? "double",
    windowFrameType: version.windowFrameType ?? "pvc",
    windowOpeningType: version.windowOpeningType ?? "casement",
    windowAreaRatio: version.windowAreaRatio ?? 0.15,
    roofWindowCount: version.roofWindowCount ?? 0,
    interiorDoorCount: version.interiorDoorCount ?? 0,
    interiorDoorType: version.interiorDoorType ?? "standard",
    hasStair: version.hasStair ?? false,
    stairType: version.stairType ?? "straight",
    stairFinish: version.stairFinish ?? "wood",
    bathroomLevel: version.bathroomLevel ?? "standard",
    bathroomType: version.bathroomType ?? "shower",
    wcType: version.wcType ?? "suspended",
    showerType: version.showerType ?? "standard",
    vanityType: version.vanityType ?? "standard",
    bathtubType: version.bathtubType ?? "standard",
    kitchenType: version.kitchenType ?? "standard",
    kitchenCredenceType: version.kitchenCredenceType ?? "tile",
    hasBuanderie: version.hasBuanderie ?? false,
    hasCellier: version.hasCellier ?? false,
    cellierStorageLevel: version.cellierStorageLevel ?? "none",
  };

  try {
    const result = await runCalculation(engineInput);

    // Idempotency: delete any existing result for this version before creating new one
    await prisma.calculationResultLine.deleteMany({
      where: { calculationResult: { projectVersionId: vid } },
    });
    await prisma.calculationResult.deleteMany({
      where: { projectVersionId: vid },
    });

    const saved = await prisma.calculationResult.create({
      data: {
        projectVersionId: version.id,
        totalCostHt: result.totalCostHt,
        totalCostTva: result.totalCostTva,
        totalCostTtc: result.totalCostTtc,
        costPerM2Ht: result.costPerM2Ht,
        costPerM2Ttc: result.costPerM2Ttc,
        confidenceLevel: result.confidenceLevel,
        breakdownJson: JSON.stringify({
          sensitivityLow: result.sensitivityLow,
          sensitivityHigh: result.sensitivityHigh,
          contingencyAmount: result.contingencyAmount,
          overheadAmount: result.overheadAmount,
          profitAmount: result.profitAmount,
        }),
        lines: {
          create: result.lots.map((lot) => ({
            costLotId: lot.lotId,
            quantity: lot.quantity,
            unit: lot.unit,
            unitPriceHt: lot.unitPriceHt,
            lineTotalHt: lot.lineTotalHt,
            appliedCoefficientsJson: JSON.stringify(lot.coefficients),
          })),
        },
      },
      include: {
        lines: { include: { costLot: { include: { translations: true } } } },
      },
    });

    return NextResponse.json({ result, savedId: saved.id });
  } catch (err) {
    console.error("[calculate] Engine error:", err);
    return NextResponse.json(
      { error: "Calculation failed. Check engine inputs." },
      { status: 500 }
    );
  }
}
