"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type PriceItem = {
  id: string;
  itemCode: string;
  referenceName: string;
  translations?: { label: string }[];
  unit: string;
  basePriceHt: number;
  confidenceLevel: string;
  sourceType: string;
  costLot: {
    code: string;
    translations: { label: string }[];
    category: { translations: { label: string }[] };
  };
  updateLogs: { updatedAt: Date; updateMethod: string }[];
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

const EN_REFERENCE_FALLBACKS: Record<string, string> = {
  "Terrassement général (sol standard)": "General earthworks (standard soil)",
  "Terrassement en zone argileuse": "Earthworks in clay area",
  "Fondations superficielles (semelles filantes)": "Shallow foundations (strip footings)",
  "Fondations profondes (micropieux)": "Deep foundations (micropiles)",
  "Dallage béton armé": "Reinforced concrete slab",
  "Maçonnerie parpaing (20cm)": "Concrete block masonry (20cm)",
  "Béton banché (refends)": "Cast-in-place concrete walls (internal)",
  "Plancher béton coulé en place": "Cast-in-place concrete floor",
  "Plancher prédalles": "Precast slab floor",
  "Charpente traditionnelle bois": "Traditional timber frame",
  "Charpente industrielle (fermettes)": "Industrial roof trusses",
  "Ossature bois (CLT/Glulam)": "Timber structure (CLT/Glulam)",
  "Tuiles terre cuite": "Clay roof tiles",
  "Ardoise naturelle": "Natural slate",
  "Toiture-terrasse (étanchéité bicouche)": "Flat roof (double-layer waterproofing)",
  "Toiture-terrasse végétalisée": "Green flat roof",
  "Fenêtre PVC double vitrage": "PVC double-glazed window",
  "Fenêtre alu double vitrage": "Aluminum double-glazed window",
  "Porte-fenêtre alu triple vitrage": "Aluminum triple-glazed patio door",
  "Porte d'entrée sécurisée": "Security entrance door",
  "Volets roulants électriques": "Electric roller shutters",
  "ITE (laine de roche 14cm)": "External insulation (14cm rock wool)",
  "ITI (laine de verre 10cm)": "Internal insulation (10cm glass wool)",
  "Isolation combles (soufflée)": "Attic insulation (blown)",
  "Isolation plancher bas": "Ground floor insulation",
  "Cloison plâtre (72/48)": "Plaster partition wall (72/48)",
  "Doublage collé": "Bonded lining",
  "Enduit intérieur (projection)": "Interior plaster (sprayed)",
  "Carrelage sol (standard)": "Floor tiles (standard)",
  "Parquet stratifié": "Laminate flooring",
  "Parquet massif chêne huilé": "Solid oiled oak parquet",
  "Carrelage mural salle de bain": "Bathroom wall tiles",
  "Pierre naturelle (granit)": "Natural stone (granite)",
  "Peinture intérieure (2 couches)": "Interior paint (2 coats)",
  "Peinture lasure façade": "Exterior wood stain paint",
  "Porte intérieure (standard)": "Interior door (standard)",
  "Porte intérieure (premium)": "Interior door (premium)",
  "Escalier bois standard": "Standard wooden staircase",
  "Escalier métal design": "Designer metal staircase",
  "Installation complète salle de bain": "Complete bathroom installation",
  "WC suspendu complet": "Complete wall-hung toilet",
  "Cuisine (alimentation / évacuation)": "Kitchen plumbing (supply / drainage)",
  "Réseau intérieur eau froide/chaude (m² SHAB)": "Internal hot/cold water network (m² SHAB)",
  "Installation électrique (standard, m² SHAB)": "Electrical installation (standard, m² SHAB)",
  "Installation électrique (premium)": "Electrical installation (premium)",
  "Tableau électrique + disjoncteurs": "Electrical panel + breakers",
  "Domotique (pack basic)": "Home automation (basic pack)",
  "Chaudière gaz condensation": "Condensing gas boiler",
  "Pompe à chaleur air/eau": "Air-to-water heat pump",
  "VMC double flux": "Dual-flow ventilation",
  "VMC simple flux": "Single-flow ventilation",
  "Radiateurs acier (m² SHAB)": "Steel radiators (m² SHAB)",
  "Plancher chauffant hydraulique": "Hydronic underfloor heating",
  "Ascenseur hydraulique (4 arrêts)": "Hydraulic elevator (4 stops)",
  "Ascenseur électrique (6 arrêts)": "Electric elevator (6 stops)",
  "Branchements réseaux (eau, élec, gaz, télécom)": "Network connections (water, electric, gas, telecom)",
  "Terrassements extérieurs / parking": "External earthworks / parking",
  "Clôture + portail": "Fence + gate",
  "Aménagement paysager (gazon + plantations)": "Landscaping (lawn + planting)",
};

const DE_REFERENCE_FALLBACKS: Record<string, string> = {
  "Terrassement général (sol standard)": "Allgemeine Erdarbeiten (Standardboden)",
  "Terrassement en zone argileuse": "Erdarbeiten in Lehmzone",
  "Fondations superficielles (semelles filantes)": "Flachgründung (Streifenfundamente)",
  "Fondations profondes (micropieux)": "Tiefgründung (Mikropfähle)",
  "Dallage béton armé": "Stahlbetonplatte",
  "Maçonnerie parpaing (20cm)": "Mauerwerk aus Betonstein (20cm)",
  "Béton banché (refends)": "Ortbetonwände (Innenwände)",
  "Plancher béton coulé en place": "Ortbetondecke",
  "Plancher prédalles": "Halbfertigteildecke",
  "Charpente traditionnelle bois": "Traditioneller Dachstuhl aus Holz",
  "Charpente industrielle (fermettes)": "Industrielle Dachbinder",
  "Ossature bois (CLT/Glulam)": "Holztragwerk (CLT/Glulam)",
  "Tuiles terre cuite": "Dachziegel aus Ton",
  "Ardoise naturelle": "Naturschiefer",
  "Toiture-terrasse (étanchéité bicouche)": "Flachdach (zweilagige Abdichtung)",
  "Toiture-terrasse végétalisée": "Begrüntes Flachdach",
  "Fenêtre PVC double vitrage": "PVC-Fenster mit Doppelverglasung",
  "Fenêtre alu double vitrage": "Aluminiumfenster mit Doppelverglasung",
  "Porte-fenêtre alu triple vitrage": "Aluminium-Balkontür mit Dreifachverglasung",
  "Porte d'entrée sécurisée": "Sicherheits-Eingangstür",
  "Volets roulants électriques": "Elektrische Rollläden",
  "ITE (laine de roche 14cm)": "Außendämmung (14cm Steinwolle)",
  "ITI (laine de verre 10cm)": "Innendämmung (10cm Glaswolle)",
  "Isolation combles (soufflée)": "Dachdämmung (Einblasdämmung)",
  "Isolation plancher bas": "Dämmung der unteren Geschossdecke",
  "Cloison plâtre (72/48)": "Gipskarton-Trennwand (72/48)",
  "Doublage collé": "Verklebte Vorsatzschale",
  "Enduit intérieur (projection)": "Innenputz (gespritzt)",
  "Carrelage sol (standard)": "Bodenfliesen (Standard)",
  "Parquet stratifié": "Laminatboden",
  "Parquet massif chêne huilé": "Massivparkett Eiche geölt",
  "Carrelage mural salle de bain": "Bad-Wandfliesen",
  "Pierre naturelle (granit)": "Naturstein (Granit)",
  "Peinture intérieure (2 couches)": "Innenanstrich (2 Schichten)",
  "Peinture lasure façade": "Fassadenlasur",
  "Porte intérieure (standard)": "Innentür (Standard)",
  "Porte intérieure (premium)": "Innentür (Premium)",
  "Escalier bois standard": "Standard-Holztreppe",
  "Escalier métal design": "Design-Metalltreppe",
  "Installation complète salle de bain": "Komplette Badezimmerinstallation",
  "WC suspendu complet": "Komplettes Wand-WC",
  "Cuisine (alimentation / évacuation)": "Kücheninstallation (Zu-/Abwasser)",
  "Réseau intérieur eau froide/chaude (m² SHAB)": "Internes Kalt-/Warmwassernetz (m² SHAB)",
  "Installation électrique (standard, m² SHAB)": "Elektroinstallation (Standard, m² SHAB)",
  "Installation électrique (premium)": "Elektroinstallation (Premium)",
  "Tableau électrique + disjoncteurs": "Schaltschrank + Sicherungen",
  "Domotique (pack basic)": "Hausautomation (Basispaket)",
  "Chaudière gaz condensation": "Gas-Brennwertkessel",
  "Pompe à chaleur air/eau": "Luft/Wasser-Wärmepumpe",
  "VMC double flux": "Doppelfluss-Lüftung",
  "VMC simple flux": "Einfachfluss-Lüftung",
  "Radiateurs acier (m² SHAB)": "Stahlheizkörper (m² SHAB)",
  "Plancher chauffant hydraulique": "Wassergeführte Fußbodenheizung",
  "Ascenseur hydraulique (4 arrêts)": "Hydraulischer Aufzug (4 Haltestellen)",
  "Ascenseur électrique (6 arrêts)": "Elektrischer Aufzug (6 Haltestellen)",
  "Branchements réseaux (eau, élec, gaz, télécom)": "Netzanschlüsse (Wasser, Strom, Gas, Telekom)",
  "Terrassements extérieurs / parking": "Außen-Erdarbeiten / Parkplatz",
  "Clôture + portail": "Zaun + Tor",
  "Aménagement paysager (gazon + plantations)": "Außenanlagen (Rasen + Bepflanzung)",
};

const TR_REFERENCE_FALLBACKS: Record<string, string> = {
  "Terrassement général (sol standard)": "Genel kazı (standart zemin)",
  "Terrassement en zone argileuse": "Killi zeminde kazı",
  "Fondations superficielles (semelles filantes)": "Yüzeysel temel (sürekli temel)",
  "Fondations profondes (micropieux)": "Derin temel (mikrokazık)",
  "Dallage béton armé": "Betonarme döşeme",
  "Maçonnerie parpaing (20cm)": "20 cm briket duvar",
  "Béton banché (refends)": "Perde beton (iç taşıyıcı duvar)",
  "Plancher béton coulé en place": "Yerinde dökme beton döşeme",
  "Plancher prédalles": "Predöşeme",
  "Charpente traditionnelle bois": "Geleneksel ahşap çatı taşıyıcı",
  "Charpente industrielle (fermettes)": "Endüstriyel çatı makası",
  "Ossature bois (CLT/Glulam)": "Ahşap taşıyıcı (CLT/Glulam)",
  "Tuiles terre cuite": "Kil kiremit",
  "Ardoise naturelle": "Doğal arduvaz",
  "Toiture-terrasse (étanchéité bicouche)": "Teras çatı (çift kat su yalıtımı)",
  "Toiture-terrasse végétalisée": "Yeşil teras çatı",
  "Fenêtre PVC double vitrage": "PVC çift cam pencere",
  "Fenêtre alu double vitrage": "Alüminyum çift cam pencere",
  "Porte-fenêtre alu triple vitrage": "Alüminyum üç cam balkon kapısı",
  "Porte d'entrée sécurisée": "Güvenlikli giriş kapısı",
  "Volets roulants électriques": "Elektrikli panjur",
  "ITE (laine de roche 14cm)": "Dış cephe yalıtımı (14 cm taş yünü)",
  "ITI (laine de verre 10cm)": "İç cephe yalıtımı (10 cm cam yünü)",
  "Isolation combles (soufflée)": "Çatı arası yalıtımı (üfleme)",
  "Isolation plancher bas": "Alt döşeme yalıtımı",
  "Cloison plâtre (72/48)": "Alçı bölme duvar (72/48)",
  "Doublage collé": "Yapıştırma kaplama",
  "Enduit intérieur (projection)": "İç sıva (püskürtme)",
  "Carrelage sol (standard)": "Standart yer seramiği",
  "Parquet stratifié": "Laminat parke",
  "Parquet massif chêne huilé": "Yağlı masif meşe parke",
  "Carrelage mural salle de bain": "Banyo duvar seramiği",
  "Pierre naturelle (granit)": "Doğal taş (granit)",
  "Peinture intérieure (2 couches)": "İç cephe boya (2 kat)",
  "Peinture lasure façade": "Dış cephe lasur boya",
  "Porte intérieure (standard)": "İç kapı (standart)",
  "Porte intérieure (premium)": "İç kapı (premium)",
  "Escalier bois standard": "Standart ahşap merdiven",
  "Escalier métal design": "Tasarım metal merdiven",
  "Installation complète salle de bain": "Tam banyo tesisatı",
  "WC suspendu complet": "Asma klozet komple",
  "Cuisine (alimentation / évacuation)": "Mutfak temiz su / atık su tesisatı",
  "Réseau intérieur eau froide/chaude (m² SHAB)": "İç soğuk/sıcak su hattı (m² SHAB)",
  "Installation électrique (standard, m² SHAB)": "Elektrik tesisatı (standart, m² SHAB)",
  "Installation électrique (premium)": "Elektrik tesisatı (premium)",
  "Tableau électrique + disjoncteurs": "Elektrik panosu + sigortalar",
  "Domotique (pack basic)": "Akıllı ev (temel paket)",
  "Chaudière gaz condensation": "Yoğuşmalı gaz kazanı",
  "Pompe à chaleur air/eau": "Hava/su ısı pompası",
  "VMC double flux": "Çift akışlı havalandırma",
  "VMC simple flux": "Tek akışlı havalandırma",
  "Radiateurs acier (m² SHAB)": "Çelik radyatörler (m² SHAB)",
  "Plancher chauffant hydraulique": "Hidronik yerden ısıtma",
  "Ascenseur hydraulique (4 arrêts)": "Hidrolik asansör (4 durak)",
  "Ascenseur électrique (6 arrêts)": "Elektrikli asansör (6 durak)",
  "Branchements réseaux (eau, élec, gaz, télécom)": "Şebeke bağlantıları (su, elektrik, gaz, telekom)",
  "Terrassements extérieurs / parking": "Dış kazı / otopark",
  "Clôture + portail": "Çit + kapı",
  "Aménagement paysager (gazon + plantations)": "Peyzaj düzenlemesi (çim + bitkilendirme)",
};

const LOCALE_REFERENCE_FALLBACKS: Record<string, Record<string, string>> = {
  en: EN_REFERENCE_FALLBACKS,
  de: DE_REFERENCE_FALLBACKS,
  tr: TR_REFERENCE_FALLBACKS,
};

function fmt(val: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function getLocalizedReferenceName(item: PriceItem, locale: string) {
  const translated = item.translations?.[0]?.label;
  if (translated) return translated;
  const localeMap = LOCALE_REFERENCE_FALLBACKS[locale];
  if (localeMap) return localeMap[item.referenceName] ?? item.referenceName;
  return item.referenceName;
}

export default function PriceLibraryClient({
  items,
  isAdmin,
  locale,
}: {
  items: PriceItem[];
  isAdmin: boolean;
  locale: string;
}) {
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [filterLot, setFilterLot] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [bulkLot, setBulkLot] = useState("all");
  const [bulkMessage, setBulkMessage] = useState("");
  const [localItems, setLocalItems] = useState(items);

  const lots = Array.from(new Set(items.map((i) => i.costLot.code)));

  const filtered = localItems.filter((item) => {
    const matchSearch =
      !search ||
      item.referenceName.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(search.toLowerCase());
    const matchLot = filterLot === "all" || item.costLot.code === filterLot;
    return matchSearch && matchLot;
  });

  const handleSavePrice = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/price-library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, basePriceHt: parseFloat(editPrice) }),
      });
      if (res.ok) {
        setLocalItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, basePriceHt: parseFloat(editPrice) } : item
          )
        );
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    const pct = parseFloat(bulkPercent);
    if (!Number.isFinite(pct)) {
      setBulkMessage("Gecerli bir yuzde girin.");
      return;
    }

    setBulkSaving(true);
    setBulkMessage("");

    try {
      const res = await fetch("/api/price-library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          percentage: pct,
          lotCode: bulkLot,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setBulkMessage(err.error || "Toplu guncelleme basarisiz.");
        return;
      }

      const payload = await res.json();
      const ids = new Set<string>((payload.ids || []) as string[]);
      const multiplier = 1 + pct / 100;

      setLocalItems((prev) =>
        prev.map((item) => {
          if (!ids.has(item.id)) return item;
          const nextPrice = Math.max(0, Number((item.basePriceHt * multiplier).toFixed(2)));
          return {
            ...item,
            basePriceHt: nextPrice,
            updateLogs: [{ updatedAt: new Date(), updateMethod: "bulk_percent" }, ...(item.updateLogs || [])],
          };
        })
      );

      setBulkMessage(`${payload.updatedCount || 0} kayit guncellendi.`);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tAdmin("priceLibrary")}</h1>
        <p className="text-gray-500 mt-1">
          {tAdmin("itemsCount", { count: localItems.length })}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        {isAdmin && (
          <div className="mb-4 p-4 rounded-xl border border-blue-200 bg-blue-50">
            <div className="text-sm font-semibold text-blue-900 mb-3">Toplu Fiyat Guncelleme</div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-blue-800 mb-1">Yuzde (+/-)</label>
                <input
                  type="number"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  step="0.1"
                  className="w-28 px-3 py-2 border border-blue-300 rounded-lg text-sm text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-800 mb-1">Lot filtresi</label>
                <select
                  value={bulkLot}
                  onChange={(e) => setBulkLot(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm text-gray-900 bg-white"
                >
                  <option value="all">Tum lotlar</option>
                  {lots.map((lot) => (
                    <option key={lot} value={lot}>
                      {items.find((i) => i.costLot.code === lot)?.costLot.translations[0]?.label || lot}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleBulkUpdate}
                disabled={bulkSaving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkSaving ? "Guncelleniyor..." : "Toplu uygula"}
              </button>
            </div>
            {bulkMessage && <div className="mt-2 text-xs text-blue-800">{bulkMessage}</div>}
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={tAdmin("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterLot}
            onChange={(e) => setFilterLot(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">{tAdmin("allLots")}</option>
            {lots.map((lot) => (
              <option key={lot} value={lot}>
                {items.find((i) => i.costLot.code === lot)?.costLot.translations[0]?.label || lot}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{tAdmin("resultsCount", { count: filtered.length })}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("itemCode")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("lot")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("designation")}</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("basePrice")}</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("unit")}</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("confidence")}</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin("lastUpdated")}</th>
              {isAdmin && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{item.itemCode}</td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                    {item.costLot.translations[0]?.label || item.costLot.code}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-900">{getLocalizedReferenceName(item, locale)}</td>
                <td className="px-5 py-3 text-right">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-2 py-1 border border-blue-400 rounded text-sm text-gray-900 text-right bg-white focus:outline-none"
                        step="0.01"
                        min="0"
                        autoFocus
                      />
                      <span className="text-gray-500 text-xs">€</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900">{fmt(item.basePriceHt, locale)}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center text-gray-500">{item.unit}</td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      CONFIDENCE_COLORS[item.confidenceLevel] || CONFIDENCE_COLORS.medium
                    }`}
                  >
                    {item.confidenceLevel === "high" ? tAdmin("confidenceHigh") :
                     item.confidenceLevel === "medium" ? tAdmin("confidenceMedium") : tAdmin("confidenceLow")}
                  </span>
                </td>
                <td className="px-5 py-3 text-center text-xs text-gray-400">
                  {item.updateLogs[0]
                    ? new Date(item.updateLogs[0].updatedAt).toLocaleDateString(locale)
                    : "—"}
                </td>
                {isAdmin && (
                  <td className="px-5 py-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          disabled={saving}
                          className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? "..." : tCommon("save")}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 border border-gray-300 text-gray-600 text-xs rounded font-medium hover:bg-gray-50"
                        >
                          {tCommon("cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditPrice(item.basePriceHt.toString());
                        }}
                        className="px-2.5 py-1 text-gray-500 hover:text-blue-600 text-xs rounded hover:bg-blue-50 transition-colors font-medium"
                      >
                        {tCommon("edit")}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INSEE indices info */}
      <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">{tAdmin("indexUpdateTitle")}</div>
            <div className="text-sm text-blue-700">
              {tAdmin("indexUpdateInfo")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
