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
      finishLevel: true,
      renovationScope: true,
      energyStandard: true,
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
    finishLevelCode: version.finishLevel?.code ?? "standard",
    regionCode: version.project.region?.code ?? "OCC",
    projectTypeCode: version.project.projectType?.code ?? "new_build",
    renovationScopeCode: version.renovationScope?.code,
    energyStandardCode: version.energyStandard?.code,
    heatingType: version.heatingType,
    ventilationType: version.ventilationType,
    hasElevator: version.hasElevator,
    contingencyRate: version.contingencyRate,
    overheadRate: version.overheadRate,
    profitRate: version.profitRate,
    vatRate: version.vatRate,
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
