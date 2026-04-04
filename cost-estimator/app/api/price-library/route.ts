import { auth } from "@/auth";
﻿import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lotCode = searchParams.get("lot");
  const countryCode = searchParams.get("country") || "FR";

  const country = await prisma.country.findFirst({ where: { code: countryCode } });

  const items = await prisma.priceItem.findMany({
    where: {
      isActive: true,
      countryId: country?.id,
      ...(lotCode ? { costLot: { code: lotCode } } : {}),
    },
    include: {
      costLot: { include: { translations: true } },
      translations: true,
      region: { select: { code: true, name: true } },
      finishLevel: { select: { code: true } },
    },
    orderBy: [{ costLot: { sortOrder: "asc" } }, { itemCode: "asc" }],
  });

  return NextResponse.json(items);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userRole = String(session?.user?.role || "").toLowerCase();
  if (!session || userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const { id, basePriceHt, mode, percentage, lotCode } = body as Record<string, unknown>;

  if (mode === "bulk") {
    const pct = Number(percentage);
    if (!Number.isFinite(pct) || pct < -90 || pct > 500) {
      return NextResponse.json(
        { error: "'percentage' must be a valid number between -90 and 500" },
        { status: 400 }
      );
    }

    const multiplier = 1 + pct / 100;
    const whereClause = {
      isActive: true,
      ...(typeof lotCode === "string" && lotCode !== "all"
        ? { costLot: { code: lotCode } }
        : {}),
    } as const;

    const items = await prisma.priceItem.findMany({
      where: whereClause,
      select: { id: true, basePriceHt: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ updatedCount: 0, ids: [] });
    }

    await prisma.$transaction(
      items.map((item) => {
        const newPrice = Math.max(0, Number((item.basePriceHt * multiplier).toFixed(2)));
        return prisma.priceItem.update({
          where: { id: item.id },
          data: { basePriceHt: newPrice },
        });
      })
    );

    await prisma.$transaction(
      items.map((item) => {
        const newPrice = Math.max(0, Number((item.basePriceHt * multiplier).toFixed(2)));
        return prisma.priceUpdateLog.create({
          data: {
            priceItemId: item.id,
            oldPriceHt: item.basePriceHt,
            newPriceHt: newPrice,
            updateMethod: "bulk_percent",
            indexRef: `${pct}%`,
            updatedById: session.user.id,
          },
        });
      })
    );

    return NextResponse.json({
      updatedCount: items.length,
      ids: items.map((i) => i.id),
      percentage: pct,
    });
  }

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "'id' is required and must be a string" }, { status: 400 });
  }

  const newPrice = Number(basePriceHt);
  if (!Number.isFinite(newPrice) || newPrice < 0) {
    return NextResponse.json(
      { error: "'basePriceHt' must be a finite non-negative number" },
      { status: 400 }
    );
  }

  const old = await prisma.priceItem.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "Price item not found" }, { status: 404 });

  const updated = await prisma.priceItem.update({
    where: { id },
    data: { basePriceHt: newPrice },
  });

  await prisma.priceUpdateLog.create({
    data: {
      priceItemId: id,
      oldPriceHt: old.basePriceHt,
      newPriceHt: newPrice,
      updateMethod: "manual",
      updatedById: session.user.id,
    },
  });

  return NextResponse.json(updated);
}
