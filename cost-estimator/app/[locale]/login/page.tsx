"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/dashboard`;
      router.replace(callbackUrl);
    }
  }, [status, locale, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("invalidCredentials"));
    } else {
      const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/dashboard`;
      router.replace(callbackUrl);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">{t("loggingIn")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">ÉA</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ÉA CostEstimator</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">{t("loginTitle")}</h1>
          <p className="text-gray-500 text-sm">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm"
          >
            {loading ? t("loggingIn") : t("login")}
          </button>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700 space-y-1">
            <div className="font-semibold text-gray-800">{t("demoAccounts")}</div>
            <div>admin@elan-architecture.fr / admin123-dev-only</div>
            <div>estimator@elan-architecture.fr / estimator123-dev-only</div>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
