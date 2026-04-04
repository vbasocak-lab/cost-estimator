import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

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
      ruleType: true,
      formulaExpression: true,
      outputTarget: true,
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("conditions")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("output")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-700">{rule.ruleCode}</td>
                <td className="px-5 py-3 text-gray-900">{rule.name}</td>
                <td className="px-5 py-3 text-gray-600">{rule.formulaExpression || rule.ruleType}</td>
                <td className="px-5 py-3 text-gray-700">{rule.outputTarget || "-"}</td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-gray-500" colSpan={4}>
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
