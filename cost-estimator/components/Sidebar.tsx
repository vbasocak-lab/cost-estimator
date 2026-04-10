"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ADMIN_ROLES = ["admin", "manager"];

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: "⊞", adminOnly: false },
  { key: "projects", href: "/projects", icon: "📁", adminOnly: false },
  { key: "reports", href: "/reports", icon: "📄", adminOnly: false },
  { key: "priceLibrary", href: "/admin/price-library", icon: "💰", adminOnly: true },
  { key: "inputMapping", href: "/admin/input-mapping", icon: "🔄", adminOnly: true },
  { key: "rules", href: "/admin/rules", icon: "⚙️", adminOnly: true },
];

const LOCALES = ["fr", "en", "de", "tr"];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const tNav = useTranslations("nav");
  const [isRestrictedAccess, setIsRestrictedAccess] = useState(false);

  const locale =
    LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? "fr";

  const role = String(session?.user?.role ?? "admin").toLowerCase();
  const isAdmin = ADMIN_ROLES.includes(role);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Keep full access for authenticated internal users.
  useEffect(() => {
    if (session) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("restrictedAccess");
      }
      setIsRestrictedAccess(false);
      return;
    }

    // For anonymous visitors (WordPress lead flow), keep restriction marker.
    const sessionRestricted =
      typeof window !== "undefined" && sessionStorage.getItem("restrictedAccess") === "true";
    const cookieRestricted =
      typeof window !== "undefined" && document.cookie.includes("restrictedAccess=true");

    setIsRestrictedAccess(sessionRestricted || cookieRestricted);
  }, [session]);

  // If restricted access, hide sidebar navigation
  if (isRestrictedAccess) {
    return null;
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">
            ÉA
          </div>
          <div>
            <div className="font-semibold text-sm">ÉA CostEstimator</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map(({ key, href, icon }) => {
          const fullHref = `/${locale}${href}`;
          const active = isActive(fullHref);
          return (
            <Link
              key={key}
              href={fullHref}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{icon}</span>
              <span>{tNav(key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language switcher */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-1 mb-3">
          {LOCALES.map((l) => {
            const newPath = pathname === `/${locale}` ? `/${l}` : pathname.replace(`/${locale}/`, `/${l}/`);
            return (
              <Link
                key={l}
                href={newPath}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  l === locale ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {l.toUpperCase()}
              </Link>
            );
          })}
        </div>

        {session && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
              {session.user.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-200 truncate">{session.user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{session.user.role}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title={tNav("logout")}
            >
              →
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
