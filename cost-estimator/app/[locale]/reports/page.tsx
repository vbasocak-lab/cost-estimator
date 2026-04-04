import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

function fmt(val: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tProjects = await getTranslations({ locale, namespace: "projects" });
  const tResults = await getTranslations({ locale, namespace: "results" });
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const projects = await prisma.project.findMany({
    where: { ownerUserId: session.user.id },
    include: {
      region: { select: { name: true } },
      projectType: { include: { translations: { where: { languageCode: locale } } } },
      versions: {
        include: {
          calculationResults: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const projectsWithResults = projects.filter((p) =>
    p.versions.some((v) => v.calculationResults.length > 0)
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tNav("reports")}</h1>
        <p className="text-gray-500 mt-1">{tProjects("reportsSubtitle")}</p>
      </div>

      {projectsWithResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{tProjects("noReportsTitle")}</h2>
          <p className="text-gray-500 mb-6">{tProjects("noReportsDescription")}</p>
          <Link
            href={`/${locale}/projects/new`}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            {tProjects("createProject")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projectsWithResults.map((project) => {
            const currentVersion = project.versions.find((v) => v.isCurrent);
            const result = currentVersion?.calculationResults[0];
            if (!result) return null;

            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.projectName}</h3>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {project.projectType?.translations[0]?.label}
                      {project.region && ` · ${project.region.name}`}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span>
                        <span className="text-gray-500">{tResults("totalHt")}:</span>{" "}
                        <span className="font-semibold">{fmt(result.totalCostHt, locale)}</span>
                      </span>
                      <span>
                        <span className="text-gray-500">m²:</span>{" "}
                        <span className="font-semibold">{fmt(result.costPerM2Ht, locale)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`/api/reports/pdf?versionId=${currentVersion?.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>📥</span>
                      {tResults("exportPdf")}
                    </a>
                    <a
                      href={`/api/reports/excel?versionId=${currentVersion?.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      {tResults("exportExcel")}
                    </a>
                    <Link
                      href={`/${locale}/projects/${project.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {tProjects("viewProject")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
