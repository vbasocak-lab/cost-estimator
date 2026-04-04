import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

function formatCurrency(val: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tProjects = await getTranslations({ locale, namespace: "projects" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tResults = await getTranslations({ locale, namespace: "results" });
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: tProjects("statusDraft"), color: "bg-yellow-100 text-yellow-700" },
    active: { label: tProjects("statusActive"), color: "bg-green-100 text-green-700" },
    archived: { label: tProjects("statusArchived"), color: "bg-gray-100 text-gray-600" },
  };

  const projects = await prisma.project.findMany({
    where: { ownerUserId: session.user.id },
    include: {
      region: { select: { name: true } },
      country: { select: { code: true } },
      projectType: { include: { translations: { where: { languageCode: locale } } } },
      buildingUse: { include: { translations: { where: { languageCode: locale } } } },
      versions: {
        where: { isCurrent: true },
        include: { calculationResults: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tProjects("title")}</h1>
          <p className="text-gray-500 mt-1">{tProjects("count", { count: projects.length })}</p>
        </div>
        <Link
          href={`/${locale}/projects/new`}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + {tProjects("newProject")}
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{tProjects("emptyTitle")}</h2>
          <p className="text-gray-500 mb-6">{tProjects("emptyDescription")}</p>
          <Link
            href={`/${locale}/projects/new`}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            {tProjects("createProject")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const currentVersion = project.versions[0];
            const lastResult = currentVersion?.calculationResults[0];
            const statusInfo = statusLabels[project.status] || statusLabels.draft;

            return (
              <Link
                key={project.id}
                href={`/${locale}/projects/${project.id}`}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{project.projectName}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{project.projectType?.translations[0]?.label || "—"}</span>
                    <span>·</span>
                    <span>{project.buildingUse?.translations[0]?.label || "—"}</span>
                    {project.region && <><span>·</span><span>{project.region.name}</span></>}
                    <span>·</span>
                    <span>{tProjects("modifiedOn", { date: new Date(project.updatedAt).toLocaleDateString(locale) })}</span>
                  </div>
                  {currentVersion && (
                    <div className="text-xs text-gray-400 mt-1">
                      {tProjects("currentVersion", { label: currentVersion.label })}
                      {currentVersion.grossAreaM2 > 0 && ` · ${currentVersion.grossAreaM2} m²`}
                    </div>
                  )}
                </div>

                <div className="text-right min-w-[160px]">
                  {lastResult ? (
                    <>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(lastResult.totalCostHt, locale)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tCommon("ht")} · {formatCurrency(lastResult.costPerM2Ht, locale)}/{tCommon("m2")}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        lastResult.confidenceLevel === "avance" ? "text-green-600" :
                        lastResult.confidenceLevel === "affine" ? "text-blue-600" : "text-orange-600"
                      }`}>
                        {lastResult.confidenceLevel === "avance" ? tResults("avance") :
                         lastResult.confidenceLevel === "affine" ? tResults("affine") : tResults("indicatif")}
                      </div>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                      {tProjects("notCalculated")}
                    </span>
                  )}
                </div>

                <div className="text-gray-400 text-xl">›</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
