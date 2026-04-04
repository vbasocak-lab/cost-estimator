import { auth } from "@/auth";
export const runtime = "nodejs";
﻿import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const versionId = searchParams.get("versionId");
  if (!versionId) return NextResponse.json({ error: "versionId required" }, { status: 400 });

  const result = await prisma.calculationResult.findFirst({
    where: { projectVersionId: versionId },
    orderBy: { createdAt: "desc" },
    include: {
      projectVersion: {
        include: {
          project: {
            include: { region: true, projectType: { include: { translations: true } } },
          },
        },
      },
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

  if (!result) return NextResponse.json({ error: "No result" }, { status: 404 });

  const project = result.projectVersion.project;
  const breakdown = result.breakdownJson ? JSON.parse(result.breakdownJson) : {};

  // â”€â”€ Workbook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["ÉA CostEstimator — Rapport d'estimation"],
    [],
    ["Projet", project.projectName],
    ["Type", project.projectType?.translations?.find((t) => t.languageCode === "fr")?.label || "â€”"],
    ["RÃ©gion", project.region?.name || "â€”"],
    ["Version", result.projectVersion.label],
    ["Date", new Date().toLocaleDateString("fr-FR")],
    [],
    ["RÃ‰SULTAT FINANCIER", ""],
    ["Total HT (travaux)", result.totalCostHt],
    ["Provision alÃ©as", breakdown.contingencyAmount || 0],
    ["Frais gÃ©nÃ©raux", breakdown.overheadAmount || 0],
    ["Marge", breakdown.profitAmount || 0],
    ["Total HT", result.totalCostHt],
    ["TVA", result.totalCostTva],
    ["Total TTC", result.totalCostTtc],
    [],
    ["CoÃ»t / mÂ² HT", result.costPerM2Ht],
    ["CoÃ»t / mÂ² TTC", result.costPerM2Ttc],
    [],
    ["Niveau de confiance", result.confidenceLevel],
    ["Fourchette basse (âˆ’15%)", breakdown.sensitivityLow || result.totalCostHt * 0.85],
    ["Fourchette haute (+15%)", breakdown.sensitivityHigh || result.totalCostHt * 1.15],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1["!cols"] = [{ wch: 35 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, "RÃ©sumÃ©");

  // Sheet 2: Lot breakdown
  const lotRows = [
    ["CatÃ©gorie", "Lot", "QuantitÃ©", "UnitÃ©", "Prix unit. HT (â‚¬)", "Total HT (â‚¬)", "Part (%)"],
  ];
  for (const line of result.lines) {
    const lot = line.costLot.translations.find((t) => t.languageCode === "fr")?.label || line.costLot.code;
    const cat = line.costLot.category.translations.find((t) => t.languageCode === "fr")?.label || "â€”";
    const share = result.totalCostHt > 0 ? ((line.lineTotalHt / result.totalCostHt) * 100).toFixed(1) : "0";
    lotRows.push([cat, lot, line.quantity.toFixed(2), line.unit, line.unitPriceHt.toFixed(2), line.lineTotalHt.toFixed(2), share]);
  }
  lotRows.push(["", "TOTAL", "", "", "", result.totalCostHt.toFixed(2), "100"]);

  const ws2 = XLSX.utils.aoa_to_sheet(lotRows);
  ws2["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "DÃ©composition par lot");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="estimation-${project.projectName.replace(/\s+/g, "-")}.xlsx"`,
    },
  });
}
