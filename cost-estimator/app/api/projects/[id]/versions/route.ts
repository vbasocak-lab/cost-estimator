import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

async function assertOwner(projectId: string, userId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerUserId: true },
  });
  return project?.ownerUserId === userId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await assertOwner(id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const latest = await prisma.projectVersion.findFirst({
    where: { projectId: id },
    orderBy: { versionNumber: "desc" },
  });
  const nextNum = (latest?.versionNumber || 0) + 1;

  await prisma.projectVersion.updateMany({
    where: { projectId: id },
    data: { isCurrent: false },
  });

  const finishLevel = body.finishLevelCode
    ? await prisma.finishLevel.findUnique({ where: { code: body.finishLevelCode } })
    : null;
  const renovationScope = body.renovationScopeCode
    ? await prisma.renovationScope.findUnique({ where: { code: body.renovationScopeCode } })
    : null;
  const energyStandard = body.energyStandardCode
    ? await prisma.energyStandard.findUnique({ where: { code: body.energyStandardCode } })
    : null;
  const structureSystem = body.structureSystemCode
    ? await prisma.structureSystem.findUnique({ where: { code: body.structureSystemCode } })
    : null;

  const version = await prisma.projectVersion.create({
    data: {
      projectId: id,
      versionNumber: nextNum,
      label: String(body.label || `V${nextNum}`).slice(0, 50),
      grossAreaM2: Math.max(0, Number(body.grossAreaM2) || 0),
      netAreaM2: Math.max(0, Number(body.netAreaM2) || 0),
      floorsAboveGround: Math.max(1, Math.min(99, Number(body.floorsAboveGround) || 1)),
      floorsBelowGround: Math.max(0, Math.min(10, Number(body.floorsBelowGround) || 0)),
      commonAreaRatio: Math.max(0, Math.min(1, Number(body.commonAreaRatio) || 0.15)),
      facadeComplexity: ["simple", "standard", "complex"].includes(body.facadeComplexity)
        ? body.facadeComplexity
        : "standard",
      finishLevelId: finishLevel?.id,
      renovationScopeId: renovationScope?.id,
      energyStandardId: energyStandard?.id,
      structureSystemId: structureSystem?.id,
      hvacLevel: body.hvacLevel || "standard",
      electricalLevel: body.electricalLevel || "standard",
      heatingType: body.heatingType || "gas",
      ventilationType: body.ventilationType || "simple",
      roofType: body.roofType || "pitched",
      hasElevator: Boolean(body.hasElevator),
      contingencyRate: Math.max(0, Math.min(0.5, Number(body.contingencyRate) || 0.08)),
      overheadRate: Math.max(0, Math.min(0.5, Number(body.overheadRate) || 0.05)),
      profitRate: Math.max(0, Math.min(0.5, Number(body.profitRate) || 0.08)),
      vatRate: Math.max(0, Math.min(0.3, Number(body.vatRate) || 0.20)),
      isCurrent: true,
      // Dynamic configurator fields
      buildingUsage: body.buildingUsage || "single_family",
      estimationMode: body.estimationMode || "standard",
      surfaceShonM2: Math.max(0, Number(body.surfaceShonM2) || 0),
      surfaceShabM2: Math.max(0, Number(body.surfaceShabM2) || 0),
      aboveGroundFloors: Math.max(1, Math.min(99, Number(body.aboveGroundFloors) || 1)),
      basementFloors: Math.max(0, Math.min(10, Number(body.basementFloors) || 0)),
      bedroomCount: Math.max(0, Number(body.bedroomCount) || 0),
      bathroomCount: Math.max(0, Number(body.bathroomCount) || 0),
      wcCount: Math.max(0, Number(body.wcCount) || 0),
      roomCount: Math.max(0, Number(body.roomCount) || 0),
      hasStair: Boolean(body.hasStair),
      stairType: body.stairType || "straight",
      stairFinish: body.stairFinish || "wood",
      structureType: body.structureType || "concrete",
      energyStandard: body.energyStandard || "re2020",
      heatingSystem: body.heatingSystem || "gas",
      heatingDistribution: body.heatingDistribution || "radiators",
      electricLevel: body.electricLevel || "standard",
      elevatorRequired: Boolean(body.elevatorRequired),
      windowAreaRatio: Math.max(0, Math.min(1, Number(body.windowAreaRatio) || 0.15)),
      windowGlazingType: body.windowGlazingType || "double",
      windowFrameType: body.windowFrameType || "pvc",
      windowOpeningType: body.windowOpeningType || "casement",
      roofWindowCount: Math.max(0, Number(body.roofWindowCount) || 0),
      doorWindowType: body.doorWindowType || "standard",
      interiorDoorCount: Math.max(0, Number(body.interiorDoorCount) || 0),
      interiorDoorType: body.interiorDoorType || "standard",
      bathroomLevel: body.bathroomLevel || "standard",
      bathroomType: body.bathroomType || "shower",
      wcType: body.wcType || "suspended",
      showerType: body.showerType || "standard",
      vanityType: body.vanityType || "standard",
      bathtubType: body.bathtubType || "standard",
      kitchenType: body.kitchenType || "standard",
      kitchenCredenceType: body.kitchenCredenceType || "tile",
      hasBuanderie: Boolean(body.hasBuanderie),
      hasCellier: Boolean(body.hasCellier),
      cellierStorageLevel: body.cellierStorageLevel || "none",
      finishLevel: body.finishLevel || "standard",
      riskPercent: Math.max(0, Math.min(50, Number(body.riskPercent) || 8)),
      overheadPercent: Math.max(0, Math.min(50, Number(body.overheadPercent) || 5)),
      profitPercent: Math.max(0, Math.min(50, Number(body.profitPercent) || 8)),
      vatPercent: Math.max(0, Math.min(30, Number(body.vatPercent) || 20)),
    },
  });

  if (body.regionCode) {
    const region = await prisma.region.findFirst({ where: { code: String(body.regionCode) } });
    if (region) {
      await prisma.project.update({ where: { id }, data: { regionId: region.id } });
    }
  }

  return NextResponse.json(version, { status: 201 });
}
