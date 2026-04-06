"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function RestrictedAccessGuard({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Internal/authenticated users should always have full access.
    if (status === "authenticated") {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("restrictedAccess");
      }
      setIsChecked(true);
      return;
    }

    // Check if restrictedAccess is in URL params
    const urlRestricted = searchParams.get("restrictedAccess") === "true";

    // Get from sessionStorage (persists during session navigation)
    const storageRestricted =
      typeof window !== "undefined" && sessionStorage.getItem("restrictedAccess") === "true";

    if (urlRestricted || storageRestricted) {
      // WordPress lead flow: save marker and restrict navigation.
      if (urlRestricted) {
        sessionStorage.setItem("restrictedAccess", "true");
      }

      // Allow only project creation flow pages for WordPress leads.
      const canAccessNew = pathname.startsWith(`/${locale}/projects/new`);
      const canAccessProjectDetail = new RegExp(`^/${locale}/projects/[^/]+$`).test(pathname);
      const canAccessProjectReport = new RegExp(`^/${locale}/projects/[^/]+/report$`).test(pathname);
      const isAllowed = canAccessNew || canAccessProjectDetail || canAccessProjectReport;

      if (!isAllowed) {
        router.push(`/${locale}/projects/new`);
        return;
      }
    } else if (status === "unauthenticated") {
      // Server-side auth() provides an anonymous bypass session so the app stays usable
      // even when no explicit NextAuth session exists. Keep client routing aligned.
      setIsChecked(true);
      return;
    }

    setIsChecked(true);
  }, [pathname, locale, router, searchParams, status]);

  // Return component only after check is complete
  if (!isChecked) {
    return null;
  }

  return null;
}

export default function Providers({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages} locale={locale} timeZone="Europe/Paris">
        <RestrictedAccessGuard locale={locale} />
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}


