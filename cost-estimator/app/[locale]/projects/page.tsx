import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProjectsListClient from "./ProjectsListClient";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tProjects = await getTranslations({ locale, namespace: "projects" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tResults = await getTranslations({ locale, namespace: "results" });
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

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

  const labels = {
    title: tProjects("title"),
    count: tProjects("count", { count: projects.length }),
    newProject: tProjects("newProject"),
    emptyTitle: tProjects("emptyTitle"),
    emptyDescription: tProjects("emptyDescription"),
    createProject: tProjects("createProject"),
    modifiedOnPrefix: tProjects("modifiedOn", { date: "" }).trim(),
    currentVersionPrefix: tProjects("currentVersion", { label: "" }).trim(),
    notCalculated: tProjects("notCalculated"),
    ht: tCommon("ht"),
    m2: tCommon("m2"),
    indicative: tResults("indicatif"),
    refined: tResults("affine"),
    advanced: tResults("avance"),
    statusDraft: tProjects("statusDraft"),
    statusActive: tProjects("statusActive"),
    statusArchived: tProjects("statusArchived"),
    delete: tCommon("delete"),
    deleting: tCommon("loading"),
    deleteConfirm: "Bu projeyi silmek istediğinize emin misiniz?",
    deleteError: "Proje silinemedi.",
  };

  const viewProjects = projects.map((project) => {
    const currentVersion = project.versions[0];
    const lastResult = currentVersion?.calculationResults[0];
    return {
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      updatedAt: project.updatedAt.toISOString(),
      regionName: project.region?.name ?? null,
      projectTypeLabel: project.projectType?.translations[0]?.label || "—",
      buildingUseLabel: project.buildingUse?.translations[0]?.label || "—",
      currentVersionLabel: currentVersion?.label ?? null,
      currentVersionGrossAreaM2: currentVersion?.grossAreaM2 ?? null,
      totalCostHt: lastResult?.totalCostHt ?? null,
      costPerM2Ht: lastResult?.costPerM2Ht ?? null,
      confidenceLevel: lastResult?.confidenceLevel ?? null,
    };
  });

  return <ProjectsListClient locale={locale} projects={viewProjects} labels={labels} />;
}
