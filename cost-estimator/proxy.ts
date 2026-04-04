import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["fr", "en", "de", "tr"];

// Routes that do NOT require authentication (exact suffix match after locale)
const PUBLIC_SUFFIXES = ["/", "/login", "/register"];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "fr",
  localePrefix: "always",
});

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip locale prefix to get the path suffix
  const localePrefix = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  const suffix = localePrefix
    ? pathname.slice(`/${localePrefix}`.length) || "/"
    : pathname;

  // Public routes bypass auth
  const isPublic = PUBLIC_SUFFIXES.includes(suffix);

  if (isPublic) {
    return intlMiddleware(req as unknown as NextRequest);
  }

  return intlMiddleware(req as unknown as NextRequest);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};