import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const lots = await prisma.costLot.findMany({
    where: { isActive: true },
    include: {
      translations: true,
      category: { include: { translations: true } },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return NextResponse.json(lots);
}
