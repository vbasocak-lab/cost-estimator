import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const ALLOWED_STATUSES = ["draft", "active", "archived"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      country: true,
      region: true,
      projectType: { include: { translations: true } },
      buildingUse: { include: { translations: true } },
      versions: {
        include: {
          finishLevel: true,
          renovationScope: true,
          energyStandard: true,
          structureSystem: true,
          calculationResults: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { versionNumber: "asc" },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Ownership check
  if (project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Ownership check before mutation
  const existing = await prisma.project.findUnique({ where: { id }, select: { ownerUserId: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Allowlist for status values
  const status =
    body.status && ALLOWED_STATUSES.includes(body.status)
      ? body.status
      : undefined;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(body.projectName ? { projectName: String(body.projectName).slice(0, 200) } : {}),
      ...(status ? { status } : {}),
    },
  });

  return NextResponse.json(updated);
}
