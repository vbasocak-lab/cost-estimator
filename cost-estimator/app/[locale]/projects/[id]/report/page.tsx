"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ReportPage() {
  const tProjects = useTranslations("projects");
  const tResults = useTranslations("results");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const projectId = params.id as string;
  const format = searchParams.get("format");

  const [versionId, setVersionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((project) => {
        const currentVersion = project.versions?.find((v: any) => v.isCurrent);
        setVersionId(currentVersion?.id || null);
        setLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    if (!versionId || !format) return;

    if (format === "excel") {
      window.open(`/api/reports/excel?versionId=${versionId}`, "_blank");
      return;
    }

    if (format === "pdf") {
      window.open(`/api/reports/pdf?versionId=${versionId}`, "_blank");
    }
  }, [format, versionId]);

  const handleExcel = () => {
    if (!versionId) return;
    window.open(`/api/reports/excel?versionId=${versionId}`, "_blank");
  };

  const handlePdf = () => {
    if (!versionId) return;
    window.open(`/api/reports/pdf?versionId=${versionId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">{tProjects("loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="text-6xl mb-6">📄</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{tProjects("exportReportTitle")}</h1>
      <p className="text-gray-500 mb-8">{tProjects("exportReportDescription")}</p>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <button
          onClick={handlePdf}
          disabled={!versionId}
          className="flex flex-col items-center gap-3 p-6 bg-red-50 border-2 border-red-200 rounded-2xl hover:border-red-400 transition-colors disabled:opacity-50"
        >
          <span className="text-4xl">📋</span>
          <span className="font-semibold text-red-800">{tResults("exportPdf")}</span>
          <span className="text-xs text-red-600">{tProjects("pdfHint")}</span>
        </button>

        <button
          onClick={handleExcel}
          disabled={!versionId}
          className="flex flex-col items-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-2xl hover:border-green-400 transition-colors disabled:opacity-50"
        >
          <span className="text-4xl">📊</span>
          <span className="font-semibold text-green-800">{tResults("exportExcel")}</span>
          <span className="text-xs text-green-600">{tProjects("excelHint")}</span>
        </button>
      </div>

      <div className="mt-8">
        <Link
          href={`/${locale}/projects/${projectId}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {tProjects("backToProject")}
        </Link>
      </div>
    </div>
  );
}
