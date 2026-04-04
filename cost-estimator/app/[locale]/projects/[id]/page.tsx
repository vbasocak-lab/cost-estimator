import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

function fmt(val: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: projectId } = await params;
  const tProjects = await getTranslations({ locale, namespace: "projects" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tResults = await getTranslations({ locale, namespace: "results" });
  const tLots = await getTranslations({ locale, namespace: "lots" });
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const confidenceConfig: Record<string, { label: string; color: string; bg: string }> = {
    indicatif: { label: tResults("indicatif"), color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    affine: { label: tResults("affine"), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    avance: { label: tResults("avance"), color: "text-green-700", bg: "bg-green-50 border-green-200" },
  };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      country: true,
      region: true,
      projectType: { include: { translations: { where: { languageCode: locale } } } },
      buildingUse: { include: { translations: { where: { languageCode: locale } } } },
      versions: {
        include: {
          finishLevel: true,
          energyStandard: true,
          structureSystem: true,
          calculationResults: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              lines: {
                include: {
                  costLot: {
                    include: {
                      translations: { where: { languageCode: locale } },
                      category: { include: { translations: { where: { languageCode: locale } } } },
                    },
                  },
                },
                orderBy: { lineTotalHt: "desc" },
              },
            },
          },
        },
        orderBy: { versionNumber: "asc" },
      },
    },
  });

  if (!project) redirect(`/${locale}/projects`);

  const currentVersion = project.versions.find((v) => v.isCurrent) || project.versions[0];
  const result = currentVersion?.calculationResults[0];
  const breakdown = result?.breakdownJson ? JSON.parse(result.breakdownJson) : null;
  const confidence = result ? confidenceConfig[result.confidenceLevel] || confidenceConfig.indicatif : null;

  // Group lines by category
  const linesByCategory = result
    ? result.lines.reduce(
        (acc, line) => {
          const cat = line.costLot.category.translations[0]?.label || tProjects("other");
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(line);
          return acc;
        },
        {} as Record<string, typeof result.lines>
      )
    : {};

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href={`/${locale}/projects`} className="hover:text-gray-700">{tProjects("title")}</Link>
            <span>›</span>
            <span className="text-gray-900">{project.projectName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{project.projectType?.translations[0]?.label}</span>
            {project.region && <><span>·</span><span>{project.region.name}</span></>}
            {currentVersion && <><span>·</span><span>{tProjects("versionLabel", { label: currentVersion.label })}</span></>}
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/projects/new`}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            {tProjects("newVersion")}
          </Link>
          {result && (
            <Link
              href={`/${locale}/projects/${projectId}/report`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
            >
              {tResults("exportPdf")}
            </Link>
          )}
        </div>
      </div>

      {!result ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🔢</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{tProjects("notCalculatedTitle")}</h2>
          <p className="text-gray-500 mb-6">{tProjects("notCalculatedDescription")}</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{tResults("totalHt")}</div>
              <div className="text-xl font-bold text-gray-900">{fmt(result.totalCostHt, locale)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{tResults("totalTtc")}</div>
              <div className="text-xl font-bold text-blue-600">{fmt(result.totalCostTtc, locale)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{tResults("costPerM2")}</div>
              <div className="text-xl font-bold text-gray-900">{fmt(result.costPerM2Ht, locale)}</div>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${confidence?.bg}`}>
              <div className="text-xs text-gray-500 mb-1">{tResults("confidence")}</div>
              <div className={`text-xl font-bold ${confidence?.color}`}>{confidence?.label}</div>
            </div>
          </div>

          {/* Sensitivity range */}
          {breakdown && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">{tProjects("sensitivityRange")}</div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-500">{tProjects("lowHypothesis")}</div>
                  <div className="font-semibold text-gray-900">{fmt(breakdown.sensitivityLow, locale)}</div>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                  <div className="absolute inset-y-0 left-[15%] right-[15%] bg-blue-500 rounded-full" />
                </div>
                <div className="text-sm text-right">
                  <div className="text-gray-500">{tProjects("highHypothesis")}</div>
                  <div className="font-semibold text-gray-900">{fmt(breakdown.sensitivityHigh, locale)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center text-sm">
                  <div className="text-gray-500">{tResults("contingency")}</div>
                  <div className="font-medium">{fmt(breakdown.contingencyAmount, locale)}</div>
                </div>
                <div className="text-center text-sm">
                  <div className="text-gray-500">{tResults("overhead")}</div>
                  <div className="font-medium">{fmt(breakdown.overheadAmount, locale)}</div>
                </div>
                <div className="text-center text-sm">
                  <div className="text-gray-500">{tResults("profit")}</div>
                  <div className="font-medium">{fmt(breakdown.profitAmount, locale)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Lot breakdown by category */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{tResults("byLot")}</h2>
            </div>

            {Object.entries(linesByCategory).map(([catLabel, lines]) => {
              const catTotal = lines.reduce((s, l) => s + l.lineTotalHt, 0);
              const catShare = result.totalCostHt > 0 ? (catTotal / result.totalCostHt) * 100 : 0;

              return (
                <div key={catLabel} className="border-b border-gray-50 last:border-0">
                  <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{catLabel}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                        <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${catShare}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{catShare.toFixed(0)}%</span>
                      <span className="text-sm font-semibold text-gray-900 w-28 text-right">{fmt(catTotal, locale)}</span>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <tbody>
                      {lines.map((line) => {
                        const lotLabel = line.costLot.translations[0]?.label || line.costLot.code;
                        const coefs = line.appliedCoefficientsJson
                          ? JSON.parse(line.appliedCoefficientsJson)
                          : {};
                        return (
                          <tr key={line.id} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{lotLabel}</td>
                            <td className="px-3 py-3 text-gray-500 text-right">
                              {line.quantity.toFixed(1)} {line.unit}
                            </td>
                            <td className="px-3 py-3 text-gray-500 text-right">
                              {fmt(line.unitPriceHt, locale)} / {line.unit}
                            </td>
                            <td className="px-3 py-3 text-gray-500 text-xs text-center">
                              {coefs.regional ? (
                                <span title={tLots("coefficients")}>
                                  ×{coefs.regional.toFixed(2)} · ×{coefs.quality?.toFixed(2)} · ×{coefs.complexity?.toFixed(2)}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">
                              {fmt(line.lineTotalHt, locale)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Total row */}
            <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
              <span className="font-semibold">{tProjects("totalWorks")}</span>
              <span className="font-bold text-lg">
                {fmt(result.lines.reduce((s, l) => s + l.lineTotalHt, 0), locale)}
              </span>
            </div>
          </div>

          {/* Versions panel */}
          {project.versions.length > 1 && (
            <div className="mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">{tProjects("projectVersions")}</h2>
              <div className="space-y-2">
                {project.versions.map((v) => {
                  const vResult = v.calculationResults[0];
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        v.isCurrent ? "border-blue-200 bg-blue-50" : "border-gray-100"
                      }`}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">{v.label}</span>
                        {v.isCurrent && (
                          <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            {tProjects("current")}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {v.grossAreaM2 > 0 ? `${v.grossAreaM2} m²` : "—"}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {vResult ? `${fmt(vResult.totalCostHt, locale)} ${tCommon("ht")}` : tProjects("notCalculated")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
