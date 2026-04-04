import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { vid } = await params;

  const result = await prisma.calculationResult.findFirst({
    where: { projectVersionId: vid },
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: {
          costLot: {
            include: {
              translations: true,
              category: { include: { translations: true } },
            },
          },
        },
        orderBy: { lineTotalHt: "desc" },
      },
    },
  });

  if (!result) return NextResponse.json({ error: "No result found" }, { status: 404 });

  return NextResponse.json(result);
}
