import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";

function formatCurrency(val: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tDash = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });
  const tProjects = await getTranslations({ locale, namespace: "projects" });
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  let projects: any[] = [];
  let latestIndex: { value: number; periodDate: Date } | null = null;

  try {
    [projects, latestIndex] = await Promise.all([
      prisma.project.findMany({
        where: { ownerUserId: session.user.id },
        include: {
          region: { select: { name: true } },
          projectType: { include: { translations: { where: { languageCode: locale } } } },
          versions: {
            where: { isCurrent: true },
            include: { calculationResults: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.marketIndex.findFirst({
        where: { code: "BT01" },
        orderBy: { periodDate: "desc" },
      }),
    ]);
  } catch {
    // Keep dashboard accessible when DB env is missing/invalid on production.
  }

  const activeEstimates = projects.filter(
    (p) => p.versions.some((v: any) => v.calculationResults.length > 0)
  ).length;

  const projectIds = projects.map((project) => project.id);
  let leadContacts: Array<{ id: string; leadEmail: string | null; leadPhone: string | null }> = [];
  if (projectIds.length) {
    try {
      leadContacts = await prisma.$queryRaw<Array<{ id: string; leadEmail: string | null; leadPhone: string | null }>>`
        SELECT "id", "leadEmail", "leadPhone"
        FROM "Project"
        WHERE "id" IN (${Prisma.join(projectIds)})
      `;
    } catch {
      leadContacts = [];
    }
  }
  const leadContactByProjectId = new Map(
    leadContacts.map((contact) => [contact.id, contact])
  );

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tDash("welcome")}, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">{tNav("dashboard")} — {tBrand("appName")} {tBrand("edition")}</p>
        </div>
        <Link
          href={`/${locale}/projects/new`}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + {tDash("newProject")}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
          <div className="text-sm text-gray-500 mt-1">{tDash("totalProjects")}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{activeEstimates}</div>
          <div className="text-sm text-gray-500 mt-1">{tDash("activeEstimates")}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{latestIndex?.value.toFixed(1) || "—"}</div>
          <div className="text-sm text-gray-500 mt-1">{tDash("lastIndex")}</div>
          {latestIndex && (
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(latestIndex.periodDate).toLocaleDateString(locale, { month: "long", year: "numeric" })}
            </div>
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{tDash("recentProjects")}</h2>
          <Link href={`/${locale}/projects`} className="text-sm text-blue-600 hover:text-blue-700">
            {tCommon("viewAll")}
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">{tDash("noProjects")}</p>
            <Link
              href={`/${locale}/projects/new`}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-block"
            >
              {tProjects("createProject")}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map((project) => {
              const currentVersion = project.versions[0];
              const lastResult = currentVersion?.calculationResults[0];
              const leadContact = leadContactByProjectId.get(project.id);
              return (
                <div
                  key={project.id}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <Link href={`/${locale}/projects/${project.id}`} className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{project.projectName}</div>
                    <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
                      <span>{project.projectType?.translations[0]?.label || "—"}</span>
                      {project.region && <span>· {project.region.name}</span>}
                      <span>· {new Date(project.updatedAt).toLocaleDateString(locale)}</span>
                    </div>
                  </Link>
                  <div className="text-right ml-4">
                    {lastResult ? (
                      <>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(lastResult.totalCostHt, locale)} {tCommon("ht")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(lastResult.costPerM2Ht, locale)} / {tCommon("m2")}
                        </div>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                        {tProjects("notCalculated")}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Link href={`/${locale}/projects/${project.id}`} className="text-gray-400 hover:text-gray-600">›</Link>
                    {(leadContact?.leadEmail || leadContact?.leadPhone) && (
                      <div className="flex flex-col items-end gap-1 text-xs">
                        {leadContact?.leadEmail && (
                          <a
                            href={`mailto:${leadContact.leadEmail}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {leadContact.leadEmail}
                          </a>
                        )}
                        {leadContact?.leadPhone && (
                          <a
                            href={`tel:${leadContact.leadPhone}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {leadContact.leadPhone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Index panel */}
      <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 mb-3">{tDash("indicesTitle")}</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { code: "BT01", label: tDash("indexBt01"), value: 128.4 },
            { code: "BT50", label: tDash("indexBt50"), value: 131.8 },
            { code: "BT54", label: tDash("indexBt54"), value: 127.3 },
            { code: "ICC", label: tDash("indexIcc"), value: 2042.0 },
            { code: "BT02", label: tDash("indexBt02"), value: 125.1 },
          ].map(({ code, label, value }) => (
            <div key={code} className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{code}</div>
              <div className="font-bold text-gray-900">{value.toFixed(1)}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
