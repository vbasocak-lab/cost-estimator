import Link from "next/link";
import { getTranslations } from "next-intl/server";

const LOCALE_LABELS = { fr: "Français", en: "English", de: "Deutsch", tr: "Türkçe" };

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">ÉA</span>
            </div>
            <span className="font-semibold text-gray-900">ÉA CostEstimator</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex gap-1">
              {(["fr", "en", "de", "tr"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                    l === locale
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/dashboard`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            MVP — France · 4 langues
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-10">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors text-lg"
            >
              {t("hero.demo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            {t("features.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: "architects", icon: "📐", desc: "Estimations rapides pour la conception" },
              { key: "promoteurs", icon: "🏗️", desc: "Faisabilité financière et comparaison" },
              { key: "investisseurs", icon: "📊", desc: "Analyse de rentabilité détaillée" },
              { key: "particuliers", icon: "🏠", desc: "Maîtrise de votre budget travaux" },
            ].map(({ key, icon, desc }) => (
              <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`features.${key as "architects"}`)}
                </h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
          Comment ça marche ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Décrivez votre projet", desc: "Type, surface, région, niveau de finition en 5 étapes guidées." },
            { step: "02", title: "Estimation automatique", desc: "Le moteur calcule par lot selon les données de marché françaises actualisées." },
            { step: "03", title: "Analysez et exportez", desc: "Rapport PDF, export Excel, comparaison de scénarios, analyse de sensibilité." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "16", label: "Lots de travaux" },
              { value: "12", label: "Régions françaises" },
              { value: "80+", label: "Articles de prix" },
              { value: "4", label: "Langues supportées" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold mb-1">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Prêt à estimer votre projet ?
        </h2>
        <p className="text-gray-600 mb-8">Accès gratuit. Aucune carte bancaire requise.</p>
        <Link
          href={`/${locale}/login`}
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
        >
          {t("hero.cta")}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 ÉA CostEstimator</span>
          <span>Données INSEE · BT indices · Marché français</span>
        </div>
      </footer>
    </div>
  );
}
