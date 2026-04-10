import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function InputMappingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const allowedRoles = ["admin", "manager"];
  const userRole = String(session.user.role || "").toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  const tAdmin = await getTranslations({ locale, namespace: "admin" });

  // Fetch all price code mappings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappings = await (prisma as any).priceCodeMapping.findMany({
    orderBy: [{ priority: "desc" }, { inputKey: "asc" }],
  }).catch(() => []);

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tAdmin("inputMapping")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Map project inputs to active article codes per lot. Configure replace/add/disable logic.
          </p>
        </div>
        <a
          href={`/${locale}/admin/input-mapping/new`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          + New Mapping
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Input Key</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trigger Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Target Lot</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Default Codes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Override Codes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Replace Mode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity Mode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mappings.map((mapping: { 
              id: string; 
              inputKey: string; 
              inputValue: string; 
              targetLot: string; 
              defaultCodes: string[]; 
              overrideCodes: string[]; 
              replaceMode: string; 
              quantityMode: string; 
              priority: number; 
              isActive: boolean;
            }) => (
              <tr key={mapping.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{mapping.inputKey}</td>
                <td className="px-4 py-3 text-gray-900">{mapping.inputValue}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{mapping.targetLot}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={mapping.defaultCodes?.join(", ")}>
                  {mapping.defaultCodes?.join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={mapping.overrideCodes?.join(", ")}>
                  {mapping.overrideCodes?.join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                    mapping.replaceMode === "replace" 
                      ? "bg-orange-100 text-orange-700" 
                      : mapping.replaceMode === "add"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {mapping.replaceMode}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{mapping.quantityMode}</td>
                <td className="px-4 py-3 text-gray-600">{mapping.priority}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex w-2 h-2 rounded-full ${mapping.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-gray-500 text-center" colSpan={9}>
                  No mappings configured yet. Create your first mapping to customize article activation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Documentation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How Input Mapping Works</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Input Key:</strong> The project field to match (e.g., structureType, heatingSystem)</li>
          <li><strong>Trigger Value:</strong> The value that activates this rule (e.g., concrete, heat_pump)</li>
          <li><strong>Target Lot:</strong> Which cost lot to modify (e.g., gros_oeuvre_structure, chauffage_ventilation)</li>
          <li><strong>Replace Mode:</strong> replace = overwrite codes, add = append codes, disable = remove codes</li>
          <li><strong>Quantity Mode:</strong> How to calculate quantities (surface_shon, surface_shab, count_fixed, etc.)</li>
          <li><strong>Priority:</strong> Higher priority rules are applied last (they win)</li>
        </ul>
      </div>
    </div>
  );
}
