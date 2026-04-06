import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { ownerUserId: session.user.id },
    include: {
      country: { select: { code: true, name: true } },
      region: { select: { code: true, name: true } },
      projectType: { include: { translations: { where: { languageCode: "fr" } } } },
      buildingUse: { include: { translations: { where: { languageCode: "fr" } } } },
      versions: {
        where: { isCurrent: true },
        include: { calculationResults: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const country = await prisma.country.findFirst({ where: { code: body.countryCode || "FR" } });
  if (!country) return NextResponse.json({ error: "Country not found" }, { status: 400 });

  const projectType = body.projectTypeCode
    ? await prisma.projectType.findUnique({ where: { code: body.projectTypeCode } })
    : null;
  const buildingUse = body.buildingUseCode
    ? await prisma.buildingUse.findUnique({ where: { code: body.buildingUseCode } })
    : null;
  const region = body.regionCode
    ? await prisma.region.findFirst({ where: { code: body.regionCode, countryId: country.id } })
    : null;

  const project = await prisma.project.create({
    data: {
      projectName: body.projectName,
      ownerUserId: session.user.id,
      companyId: session.user.companyId || undefined,
      countryId: country.id,
      regionId: region?.id,
      city: body.city,
      postalCode: body.postalCode,
      projectTypeId: projectType?.id,
      buildingUseId: buildingUse?.id,
      status: "draft",
    },
  });

  if (body.leadEmail || body.leadPhone) {
    await prisma.$executeRaw`
      UPDATE "Project"
      SET "leadEmail" = ${body.leadEmail || null},
          "leadPhone" = ${body.leadPhone || null}
      WHERE "id" = ${project.id}
    `;
  }

  // Create initial version
  await prisma.projectVersion.create({
    data: {
      projectId: project.id,
      versionNumber: 1,
      label: "V1",
      isCurrent: true,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
