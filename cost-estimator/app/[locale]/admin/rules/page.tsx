import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

function formatJsonCell(value: string | null): string {
  if (!value) return "-";
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.entries(parsed)
      .map(([key, entryValue]) => {
        if (Array.isArray(entryValue)) return `${key}: ${entryValue.join(", ")}`;
        if (typeof entryValue === "object" && entryValue !== null) {
          return `${key}: ${Object.entries(entryValue)
            .map(([nestedKey, nestedValue]) => `${nestedKey}=${nestedValue}`)
            .join(", ")}`;
        }
        return `${key}: ${String(entryValue)}`;
      })
      .join(" | ");
  } catch {
    return value;
  }
}

export default async function RulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const allowedRoles = ["admin", "manager"];
  const userRole = String(session.user.role || "").toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  const tAdmin = await getTranslations({ locale, namespace: "admin" });

  const rules = await prisma.calculationRule.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "asc" }, { ruleCode: "asc" }],
    select: {
      id: true,
      ruleCode: true,
      name: true,
      labelFr: true,
      labelTr: true,
      ruleType: true,
      priority: true,
      regionScope: true,
      conditionJson: true,
      actionJson: true,
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tAdmin("rules")}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("ruleCode")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("label")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Scope</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("conditions")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("output")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-700">{rule.ruleCode}</td>
                <td className="px-5 py-3 text-gray-900">{locale === "tr" ? rule.labelTr || rule.name : rule.labelFr || rule.name}</td>
                <td className="px-5 py-3 text-gray-600">{rule.ruleType}</td>
                <td className="px-5 py-3 text-gray-600">{rule.priority}</td>
                <td className="px-5 py-3 text-gray-600">{rule.regionScope || "ALL"}</td>
                <td className="px-5 py-3 text-gray-600 max-w-xs">{formatJsonCell(rule.conditionJson)}</td>
                <td className="px-5 py-3 text-gray-700 max-w-xs">{formatJsonCell(rule.actionJson)}</td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-gray-500" colSpan={7}>
                  -
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
