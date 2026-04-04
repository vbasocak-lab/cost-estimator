import { auth } from "@/auth";
import EstimatePdfDocument from "@/components/report/EstimatePdfDocument";
import { prisma } from "@/lib/db/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CONFIDENCE_LABELS: Record<string, string> = {
  indicatif: "Indicatif",
  affine: "Affine",
  avance: "Avance",
};

function sanitizeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function parseBreakdown(value: string | null) {
  if (!value) return {} as Record<string, number>;
  try {
    return JSON.parse(value) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const versionId = searchParams.get("versionId");
  if (!versionId) {
    return NextResponse.json({ error: "versionId required" }, { status: 400 });
  }

  const result = await prisma.calculationResult.findFirst({
    where: { projectVersionId: versionId },
    orderBy: { createdAt: "desc" },
    include: {
      projectVersion: {
        include: {
          project: {
            include: {
              region: true,
              projectType: { include: { translations: true } },
            },
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
  if (project.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const breakdown = parseBreakdown(result.breakdownJson);
  const projectTypeLabel =
    project.projectType?.translations.find((item) => item.languageCode === "fr")?.label || null;

  const pdfDocument = EstimatePdfDocument({
    generatedAt: new Date().toLocaleDateString("fr-FR"),
    projectName: project.projectName,
    projectTypeLabel,
    regionName: project.region?.name || null,
    versionLabel: result.projectVersion.label,
    totalCostHt: result.totalCostHt,
    totalCostTva: result.totalCostTva,
    totalCostTtc: result.totalCostTtc,
    costPerM2Ht: result.costPerM2Ht,
    costPerM2Ttc: result.costPerM2Ttc,
    confidenceLabel: CONFIDENCE_LABELS[result.confidenceLevel] || result.confidenceLevel,
    sensitivityLow: breakdown.sensitivityLow || result.totalCostHt * 0.85,
    sensitivityHigh: breakdown.sensitivityHigh || result.totalCostHt * 1.15,
    contingencyAmount: breakdown.contingencyAmount || 0,
    overheadAmount: breakdown.overheadAmount || 0,
    profitAmount: breakdown.profitAmount || 0,
    lines: result.lines.map((line) => ({
      categoryLabel:
        line.costLot.category.translations.find((item) => item.languageCode === "fr")?.label ||
        "Autre",
      lotLabel:
        line.costLot.translations.find((item) => item.languageCode === "fr")?.label ||
        line.costLot.code,
      quantity: line.quantity,
      unit: line.unit,
      unitPriceHt: line.unitPriceHt,
      lineTotalHt: line.lineTotalHt,
      sharePct: result.totalCostHt > 0 ? (line.lineTotalHt / result.totalCostHt) * 100 : 0,
    })),
  }) as Parameters<typeof renderToBuffer>[0];

  const buffer = await renderToBuffer(pdfDocument);
  const body = new Uint8Array(buffer);
  const fileName = `estimation-${sanitizeFilename(project.projectName || "projet")}.pdf`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}