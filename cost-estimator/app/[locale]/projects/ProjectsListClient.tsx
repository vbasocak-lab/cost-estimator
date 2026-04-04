"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectCard = {
  id: string;
  projectName: string;
  status: string;
  updatedAt: string;
  regionName: string | null;
  projectTypeLabel: string;
  buildingUseLabel: string;
  currentVersionLabel: string | null;
  currentVersionGrossAreaM2: number | null;
  totalCostHt: number | null;
  costPerM2Ht: number | null;
  confidenceLevel: string | null;
};

type Labels = {
  title: string;
  count: string;
  newProject: string;
  emptyTitle: string;
  emptyDescription: string;
  createProject: string;
  modifiedOnPrefix: string;
  currentVersionPrefix: string;
  notCalculated: string;
  ht: string;
  m2: string;
  indicative: string;
  refined: string;
  advanced: string;
  statusDraft: string;
  statusActive: string;
  statusArchived: string;
  delete: string;
  deleting: string;
  deleteConfirm: string;
  deleteError: string;
};

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProjectsListClient({
  locale,
  projects,
  labels,
}: {
  locale: string;
  projects: ProjectCard[];
  labels: Labels;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: labels.statusDraft, color: "bg-yellow-100 text-yellow-700" },
    active: { label: labels.statusActive, color: "bg-green-100 text-green-700" },
    archived: { label: labels.statusArchived, color: "bg-gray-100 text-gray-600" },
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`${labels.deleteConfirm}\n\n${projectName}`)) return;

    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || labels.deleteError);
      }
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : labels.deleteError;
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
          <p className="text-gray-500 mt-1">{labels.count}</p>
        </div>
        <Link
          href={`/${locale}/projects/new`}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + {labels.newProject}
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{labels.emptyTitle}</h2>
          <p className="text-gray-500 mb-6">{labels.emptyDescription}</p>
          <Link
            href={`/${locale}/projects/new`}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            {labels.createProject}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const statusInfo = statusLabels[project.status] || statusLabels.draft;
            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-6">
                <Link href={`/${locale}/projects/${project.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{project.projectName}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>{project.projectTypeLabel}</span>
                    <span>·</span>
                    <span>{project.buildingUseLabel}</span>
                    {project.regionName && (
                      <>
                        <span>·</span>
                        <span>{project.regionName}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{labels.modifiedOnPrefix} {new Date(project.updatedAt).toLocaleDateString(locale)}</span>
                  </div>
                  {project.currentVersionLabel && (
                    <div className="text-xs text-gray-400 mt-1">
                      {labels.currentVersionPrefix} {project.currentVersionLabel}
                      {project.currentVersionGrossAreaM2 && project.currentVersionGrossAreaM2 > 0
                        ? ` · ${project.currentVersionGrossAreaM2} m²`
                        : ""}
                    </div>
                  )}
                </Link>

                <div className="text-right min-w-[160px]">
                  {project.totalCostHt && project.costPerM2Ht ? (
                    <>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(project.totalCostHt, locale)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {labels.ht} · {formatCurrency(project.costPerM2Ht, locale)}/{labels.m2}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        project.confidenceLevel === "avance"
                          ? "text-green-600"
                          : project.confidenceLevel === "affine"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}>
                        {project.confidenceLevel === "avance"
                          ? labels.advanced
                          : project.confidenceLevel === "affine"
                          ? labels.refined
                          : labels.indicative}
                      </div>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                      {labels.notCalculated}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(project.id, project.projectName)}
                  disabled={deletingId === project.id}
                  className="px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === project.id ? labels.deleting : labels.delete}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}