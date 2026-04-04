"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [locale, router]);

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-600">{t("loggingIn")}</p>
        </div>

        <div className="mt-4 text-center">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
