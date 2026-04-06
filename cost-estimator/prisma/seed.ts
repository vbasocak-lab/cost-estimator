import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

// ─── Production guard ────────────────────────────────────────────────────────
// In production, SEED_ADMIN_PASSWORD must be set explicitly.
// This prevents accidental seeding with a predictable hardcoded credential.
function resolveAdminPassword(): string {
  const isProd = process.env.NODE_ENV === "production";
  const envPwd = process.env.SEED_ADMIN_PASSWORD;

  if (isProd) {
    if (!envPwd || envPwd.trim() === "") {
      throw new Error(
        "SEED_ADMIN_PASSWORD env var is required in production. " +
          "Set it before running db:seed:prod."
      );
    }
    return envPwd;
  }

  // Development fallback — clearly labelled, never committed to prod
  return envPwd ?? "admin123-dev-only";
}

async function main() {
  console.log("🌱 Seeding database...");

  // ─── COUNTRY ──────────────────────────────────────────────────────────────
  const france = await prisma.country.upsert({
    where: { code: "FR" },
    update: {},
    create: {
      code: "FR",
      name: "France",
      defaultCurrency: "EUR",
      defaultVatRate: 0.20,
    },
  });

  // ─── REGIONS ──────────────────────────────────────────────────────────────
  const regions = [
    { code: "IDF", name: "Île-de-France", coef: 1.25 },
    { code: "PACA", name: "Provence-Alpes-Côte d'Azur", coef: 1.10 },
    { code: "ARA", name: "Auvergne-Rhône-Alpes", coef: 1.05 },
    { code: "OCC", name: "Occitanie", coef: 1.00 },
    { code: "NAQ", name: "Nouvelle-Aquitaine", coef: 0.98 },
    { code: "BFC", name: "Bourgogne-Franche-Comté", coef: 0.95 },
    { code: "HDF", name: "Hauts-de-France", coef: 0.97 },
    { code: "GES", name: "Grand Est", coef: 0.96 },
    { code: "NOR", name: "Normandie", coef: 0.97 },
    { code: "BRE", name: "Bretagne", coef: 0.96 },
    { code: "PDL", name: "Pays de la Loire", coef: 0.97 },
    { code: "CVL", name: "Centre-Val de Loire", coef: 0.96 },
  ];

  const regionMap: Record<string, string> = {};
  for (const r of regions) {
    const reg = await prisma.region.upsert({
      where: { id: `region_${r.code}` },
      update: { coefficientDefault: r.coef },
      create: {
        id: `region_${r.code}`,
        countryId: france.id,
        code: r.code,
        name: r.name,
        coefficientDefault: r.coef,
      },
    });
    regionMap[r.code] = reg.id;
  }

  // ─── PROJECT TYPES ────────────────────────────────────────────────────────
  const ptNewBuild = await prisma.projectType.upsert({
    where: { code: "new_build" },
    update: {},
    create: { code: "new_build", sortOrder: 1 },
  });
  const ptRenovation = await prisma.projectType.upsert({
    where: { code: "renovation" },
    update: {},
    create: { code: "renovation", sortOrder: 2 },
  });
  const ptExtension = await prisma.projectType.upsert({
    where: { code: "extension" },
    update: {},
    create: { code: "extension", sortOrder: 3 },
  });

  const ptTranslations = [
    { typeId: ptNewBuild.id, lang: "fr", label: "Construction neuve" },
    { typeId: ptNewBuild.id, lang: "en", label: "New Build" },
    { typeId: ptNewBuild.id, lang: "de", label: "Neubau" },
    { typeId: ptNewBuild.id, lang: "tr", label: "Yeni İnşaat" },
    { typeId: ptRenovation.id, lang: "fr", label: "Rénovation" },
    { typeId: ptRenovation.id, lang: "en", label: "Renovation" },
    { typeId: ptRenovation.id, lang: "de", label: "Renovierung" },
    { typeId: ptRenovation.id, lang: "tr", label: "Tadilat" },
    { typeId: ptExtension.id, lang: "fr", label: "Extension" },
    { typeId: ptExtension.id, lang: "en", label: "Extension" },
    { typeId: ptExtension.id, lang: "de", label: "Erweiterung" },
    { typeId: ptExtension.id, lang: "tr", label: "Ek Yapı" },
  ];
  for (const t of ptTranslations) {
    await prisma.projectTypeTranslation.upsert({
      where: { id: `ptt_${t.typeId}_${t.lang}` },
      update: { label: t.label },
      create: { id: `ptt_${t.typeId}_${t.lang}`, projectTypeId: t.typeId, languageCode: t.lang, label: t.label },
    });
  }

  // ─── BUILDING USES ────────────────────────────────────────────────────────
  const buCodes = ["single_family", "multi_family", "office", "retail", "mixed_use"];
  const buLabels: Record<string, Record<string, string>> = {
    single_family: { fr: "Maison individuelle", en: "Single Family", de: "Einfamilienhaus", tr: "Tek Aile Konutu" },
    multi_family: { fr: "Immeuble résidentiel", en: "Multi Family", de: "Mehrfamilienhaus", tr: "Çok Aile Konutu" },
    office: { fr: "Bureaux", en: "Office", de: "Büro", tr: "Ofis" },
    retail: { fr: "Commerce", en: "Retail", de: "Handel", tr: "Ticaret" },
    mixed_use: { fr: "Usage mixte", en: "Mixed Use", de: "Mischnutzung", tr: "Karma Kullanım" },
  };
  for (const code of buCodes) {
    const bu = await prisma.buildingUse.upsert({ where: { code }, update: {}, create: { code } });
    for (const lang of ["fr", "en", "de", "tr"]) {
      await prisma.buildingUseTranslation.upsert({
        where: { id: `but_${bu.id}_${lang}` },
        update: { label: buLabels[code][lang] },
        create: { id: `but_${bu.id}_${lang}`, buildingUseId: bu.id, languageCode: lang, label: buLabels[code][lang] },
      });
    }
  }

  // ─── FINISH LEVELS ────────────────────────────────────────────────────────
  const flStandard = await prisma.finishLevel.upsert({ where: { code: "standard" }, update: {}, create: { code: "standard", coefficient: 1.0 } });
  const flPremium = await prisma.finishLevel.upsert({ where: { code: "premium" }, update: {}, create: { code: "premium", coefficient: 1.25 } });
  const flLuxury = await prisma.finishLevel.upsert({ where: { code: "luxury" }, update: {}, create: { code: "luxury", coefficient: 1.55 } });

  // ─── RENOVATION SCOPES ────────────────────────────────────────────────────
  await prisma.renovationScope.upsert({ where: { code: "light" }, update: {}, create: { code: "light", coefficient: 0.85 } });
  await prisma.renovationScope.upsert({ where: { code: "complete" }, update: {}, create: { code: "complete", coefficient: 1.0 } });
  await prisma.renovationScope.upsert({ where: { code: "heavy" }, update: {}, create: { code: "heavy", coefficient: 1.20 } });

  // ─── ENERGY STANDARDS ─────────────────────────────────────────────────────
  for (const [code, label] of [["rt2012", "RT 2012"], ["re2020", "RE 2020"], ["bbc", "BBC Effinergie"], ["passive", "Passif"]]) {
    await prisma.energyStandard.upsert({ where: { code }, update: {}, create: { code, label } });
  }

  // ─── STRUCTURE SYSTEMS ────────────────────────────────────────────────────
  for (const [code, label] of [["concrete", "Béton armé"], ["timber", "Bois / CLT"], ["steel", "Métal / Acier"], ["masonry", "Maçonnerie"], ["mixed", "Mixte"]]) {
    await prisma.structureSystem.upsert({ where: { code }, update: {}, create: { code, label } });
  }

  // ─── COST CATEGORIES ──────────────────────────────────────────────────────
  const catGros = await prisma.costCategory.upsert({ where: { code: "gros_oeuvre" }, update: {}, create: { code: "gros_oeuvre", sortOrder: 1 } });
  const catSecond = await prisma.costCategory.upsert({ where: { code: "second_oeuvre" }, update: {}, create: { code: "second_oeuvre", sortOrder: 2 } });
  const catTech = await prisma.costCategory.upsert({ where: { code: "technique" }, update: {}, create: { code: "technique", sortOrder: 3 } });
  const catVrd = await prisma.costCategory.upsert({ where: { code: "vrd" }, update: {}, create: { code: "vrd", sortOrder: 4 } });
  const catSoft = await prisma.costCategory.upsert({ where: { code: "soft_costs" }, update: {}, create: { code: "soft_costs", sortOrder: 5 } });

  const catTrans = [
    { id: catGros.id, fr: "Gros œuvre", en: "Structural Works", de: "Rohbau", tr: "Kaba Yapı" },
    { id: catSecond.id, fr: "Second œuvre", en: "Finishing Works", de: "Ausbau", tr: "İnce İşler" },
    { id: catTech.id, fr: "Lots techniques", en: "Technical Lots", de: "Technische Gewerke", tr: "Teknik İşler" },
    { id: catVrd.id, fr: "VRD / Extérieurs", en: "Site Works", de: "Erschließung", tr: "Altyapı / Dış Alanlar" },
    { id: catSoft.id, fr: "Coûts annexes", en: "Soft Costs", de: "Nebenkosten", tr: "Ek Maliyetler" },
  ];
  for (const c of catTrans) {
    for (const lang of ["fr", "en", "de", "tr"]) {
      const label = c[lang as keyof typeof c] as string;
      await prisma.costCategoryTranslation.upsert({
        where: { id: `cct_${c.id}_${lang}` },
        update: { label },
        create: { id: `cct_${c.id}_${lang}`, costCategoryId: c.id, languageCode: lang, label },
      });
    }
  }

  // ─── COST LOTS ────────────────────────────────────────────────────────────
  const lots = [
    // Gros œuvre
    { code: "terrassement", catId: catGros.id, unit: "m3", sort: 1, fr: "Terrassement", en: "Earthworks", de: "Erdarbeiten", tr: "Kazı İşleri" },
    { code: "fondations", catId: catGros.id, unit: "m3", sort: 2, fr: "Fondations", en: "Foundations", de: "Fundamente", tr: "Temel" },
    { code: "gros_oeuvre_structure", catId: catGros.id, unit: "m2", sort: 3, fr: "Structure / Maçonnerie", en: "Structure / Masonry", de: "Struktur / Mauerwerk", tr: "Yapı / Duvar" },
    { code: "charpente", catId: catGros.id, unit: "m2", sort: 4, fr: "Charpente", en: "Timber Frame", de: "Dachstuhl", tr: "Çatı Taşıyıcı" },
    { code: "couverture", catId: catGros.id, unit: "m2", sort: 5, fr: "Couverture / Étanchéité", en: "Roofing / Waterproofing", de: "Dachdecker", tr: "Çatı Örtüsü" },
    // Second œuvre
    { code: "menuiseries_ext", catId: catSecond.id, unit: "u", sort: 6, fr: "Menuiseries extérieures", en: "External Joinery", de: "Außentüren/-fenster", tr: "Dış Doğramalar" },
    { code: "isolation", catId: catSecond.id, unit: "m2", sort: 7, fr: "Isolation", en: "Insulation", de: "Wärmedämmung", tr: "Yalıtım" },
    { code: "cloisons", catId: catSecond.id, unit: "m2", sort: 8, fr: "Cloisons / Plâtrerie", en: "Partitions / Plastering", de: "Trennwände / Putz", tr: "Bölme / Sıva" },
    { code: "revetements", catId: catSecond.id, unit: "m2", sort: 9, fr: "Revêtements sols / murs", en: "Floor / Wall Finishes", de: "Boden- / Wandbeläge", tr: "Zemin / Duvar Kaplamaları" },
    { code: "peinture", catId: catSecond.id, unit: "m2", sort: 10, fr: "Peinture", en: "Painting", de: "Malerarbeiten", tr: "Boya" },
    { code: "menuiseries_int", catId: catSecond.id, unit: "u", sort: 11, fr: "Menuiseries intérieures", en: "Internal Joinery", de: "Innentüren/-fenster", tr: "İç Doğramalar" },
    // Technique
    { code: "plomberie", catId: catTech.id, unit: "forfait", sort: 12, fr: "Plomberie / Sanitaires", en: "Plumbing / Sanitary", de: "Sanitär / Rohrinstallation", tr: "Sıhhi Tesisat" },
    { code: "electricite", catId: catTech.id, unit: "forfait", sort: 13, fr: "Électricité", en: "Electrical", de: "Elektroinstallation", tr: "Elektrik" },
    { code: "chauffage_ventilation", catId: catTech.id, unit: "forfait", sort: 14, fr: "Chauffage / Ventilation", en: "Heating / Ventilation", de: "Heizung / Lüftung", tr: "Isıtma / Havalandırma" },
    { code: "ascenseur", catId: catTech.id, unit: "u", sort: 15, fr: "Ascenseur", en: "Elevator", de: "Aufzug", tr: "Asansör" },
    // VRD
    { code: "vrd", catId: catVrd.id, unit: "forfait", sort: 16, fr: "VRD / Aménagements extérieurs", en: "Site Works / Landscaping", de: "Erschließung / Außenanlagen", tr: "Altyapı / Peyzaj" },
    // Gros œuvre — rénovation spécifique
    { code: "demolition", catId: catGros.id, unit: "m2", sort: 17, fr: "Démolition", en: "Demolition", de: "Abriss", tr: "Yıkım" },
    { code: "curage", catId: catGros.id, unit: "m2", sort: 18, fr: "Curage / Désamiantage", en: "Stripping / Asbestos removal", de: "Entkernen / Asbest", tr: "Boşaltma / Asbest söküm" },
    { code: "reprises_structurelles", catId: catGros.id, unit: "forfait", sort: 19, fr: "Reprises structurelles", en: "Structural remediation", de: "Unterfangung / Sanierung", tr: "Yapısal onarım" },
    { code: "etancheite", catId: catGros.id, unit: "m2", sort: 20, fr: "Étanchéité soubassements / toiture", en: "Waterproofing", de: "Abdichtung", tr: "Su yalıtımı" },
    { code: "installation_chantier", catId: catGros.id, unit: "forfait", sort: 21, fr: "Installation de chantier", en: "Site installation", de: "Baustelleneinrichtung", tr: "Şantiye kurulumu" },
    // Second œuvre — merdiven ayrı lot
    { code: "escalier", catId: catSecond.id, unit: "u", sort: 22, fr: "Escalier", en: "Staircase", de: "Treppe", tr: "Merdiven" },
    // Technique — enerji alternatifleri
    { code: "heat_pump", catId: catTech.id, unit: "u", sort: 23, fr: "Pompe à chaleur", en: "Heat pump", de: "Wärmepumpe", tr: "Isı pompası" },
    { code: "electric_heating", catId: catTech.id, unit: "m2", sort: 24, fr: "Chauffage électrique", en: "Electric heating", de: "Elektroheizung", tr: "Elektrikli ısıtma" },
    { code: "double_flux", catId: catTech.id, unit: "u", sort: 25, fr: "VMC double flux", en: "Dual-flow VMC", de: "KWL Lüftung", tr: "Çift akışlı VMC" },
    // Aménagements intérieurs — cuisine, buanderie, cellier
    { code: "cuisine", catId: catSecond.id, unit: "forfait", sort: 26, fr: "Cuisine équipée", en: "Fitted kitchen", de: "Küche", tr: "Mutfak" },
    { code: "buanderie", catId: catSecond.id, unit: "forfait", sort: 27, fr: "Buanderie", en: "Utility room", de: "Waschküche", tr: "Çamaşırlık" },
    { code: "cellier", catId: catSecond.id, unit: "forfait", sort: 28, fr: "Cellier / Rangement", en: "Storage room", de: "Abstellraum", tr: "Kiler" },
  ];

  const lotMap: Record<string, string> = {};
  for (const l of lots) {
    const lot = await prisma.costLot.upsert({
      where: { code: l.code },
      update: { sortOrder: l.sort },
      create: { code: l.code, categoryId: l.catId, defaultUnit: l.unit, calculationMode: "formula", sortOrder: l.sort },
    });
    lotMap[l.code] = lot.id;
    for (const lang of ["fr", "en", "de", "tr"]) {
      const label = l[lang as keyof typeof l] as string;
      await prisma.costLotTranslation.upsert({
        where: { id: `clt_${lot.id}_${lang}` },
        update: { label },
        create: { id: `clt_${lot.id}_${lang}`, costLotId: lot.id, languageCode: lang, label },
      });
    }
  }

  // ─── PRICE ITEMS ──────────────────────────────────────────────────────────
  const priceItems = [
    // Terrassement
    { code: "TERR-001", lot: "terrassement", name: "Terrassement général (sol standard)", unit: "m3", price: 28 },
    { code: "TERR-002", lot: "terrassement", name: "Terrassement en zone argileuse", unit: "m3", price: 38 },
    // Fondations
    { code: "FOND-001", lot: "fondations", name: "Fondations superficielles (semelles filantes)", unit: "m3", price: 320 },
    { code: "FOND-002", lot: "fondations", name: "Fondations profondes (micropieux)", unit: "ml", price: 220 },
    { code: "FOND-003", lot: "fondations", name: "Dallage béton armé", unit: "m2", price: 85 },
    // Gros œuvre structure
    { code: "GO-001", lot: "gros_oeuvre_structure", name: "Maçonnerie parpaing (20cm)", unit: "m2", price: 95 },
    { code: "GO-002", lot: "gros_oeuvre_structure", name: "Béton banché (refends)", unit: "m2", price: 130 },
    { code: "GO-003", lot: "gros_oeuvre_structure", name: "Plancher béton coulé en place", unit: "m2", price: 110 },
    { code: "GO-004", lot: "gros_oeuvre_structure", name: "Plancher prédalles", unit: "m2", price: 90 },
    { code: "GO-005", lot: "gros_oeuvre_structure", name: "Maçonnerie pierre naturelle", unit: "m2", price: 280 },
    { code: "GO-006", lot: "gros_oeuvre_structure", name: "Structure acier (poteaux + poutres)", unit: "m2", price: 195 },
    // Charpente
    { code: "CHARP-001", lot: "charpente", name: "Charpente traditionnelle bois", unit: "m2", price: 85 },
    { code: "CHARP-002", lot: "charpente", name: "Charpente industrielle (fermettes)", unit: "m2", price: 55 },
    { code: "CHARP-003", lot: "charpente", name: "Ossature bois (CLT/Glulam)", unit: "m2", price: 145 },
    { code: "CHARP-004", lot: "charpente", name: "Charpente métallique", unit: "m2", price: 165 },
    { code: "CHARP-005", lot: "charpente", name: "Charpente mixte bois-métal", unit: "m2", price: 155 },
    // Couverture
    { code: "COUV-001", lot: "couverture", name: "Tuiles terre cuite", unit: "m2", price: 75 },
    { code: "COUV-002", lot: "couverture", name: "Ardoise naturelle", unit: "m2", price: 130 },
    { code: "COUV-003", lot: "couverture", name: "Toiture-terrasse (étanchéité bicouche)", unit: "m2", price: 95 },
    { code: "COUV-004", lot: "couverture", name: "Toiture-terrasse végétalisée", unit: "m2", price: 145 },
    // Menuiseries ext
    { code: "MEXT-001", lot: "menuiseries_ext", name: "Fenêtre PVC double vitrage", unit: "u", price: 750 },
    { code: "MEXT-002", lot: "menuiseries_ext", name: "Fenêtre alu double vitrage", unit: "u", price: 1100 },
    { code: "MEXT-003", lot: "menuiseries_ext", name: "Porte-fenêtre alu triple vitrage", unit: "u", price: 2400 },
    { code: "MEXT-004", lot: "menuiseries_ext", name: "Porte d'entrée sécurisée", unit: "u", price: 1800 },
    { code: "MEXT-005", lot: "menuiseries_ext", name: "Volets roulants électriques", unit: "u", price: 650 },
    { code: "MEXT-006", lot: "menuiseries_ext", name: "Fenêtre bois double vitrage", unit: "u", price: 1300 },
    { code: "MEXT-007", lot: "menuiseries_ext", name: "Fenêtre triple vitrage (toutes menuiseries)", unit: "u", price: 1600 },
    { code: "MEXT-008", lot: "menuiseries_ext", name: "Fenêtre de toit (Velux)", unit: "u", price: 1200 },
    { code: "MEXT-009", lot: "menuiseries_ext", name: "Baie coulissante alu large", unit: "u", price: 3200 },
    { code: "MEXT-010", lot: "menuiseries_ext", name: "Porte de garage sectionnelle", unit: "u", price: 2800 },
    { code: "MEXT-011", lot: "menuiseries_ext", name: "Brise-soleil orientable alu", unit: "u", price: 1800 },
    { code: "MEXT-012", lot: "menuiseries_ext", name: "Volets battants bois", unit: "u", price: 420 },
    { code: "MEXT-013", lot: "menuiseries_ext", name: "Fenêtre bois-alu double vitrage", unit: "u", price: 1450 },
    { code: "MEXT-014", lot: "menuiseries_ext", name: "Porte d'entrée alu premium", unit: "u", price: 3500 },
    { code: "MEXT-015", lot: "menuiseries_ext", name: "Coulissant galandage alu", unit: "u", price: 4200 },
    // Isolation
    { code: "ISO-001", lot: "isolation", name: "ITE (laine de roche 14cm)", unit: "m2", price: 95 },
    { code: "ISO-002", lot: "isolation", name: "ITI (laine de verre 10cm)", unit: "m2", price: 45 },
    { code: "ISO-003", lot: "isolation", name: "Isolation combles (soufflée)", unit: "m2", price: 38 },
    { code: "ISO-004", lot: "isolation", name: "Isolation plancher bas", unit: "m2", price: 52 },
    // Cloisons
    { code: "CLOI-001", lot: "cloisons", name: "Cloison plâtre (72/48)", unit: "m2", price: 55 },
    { code: "CLOI-002", lot: "cloisons", name: "Doublage collé", unit: "m2", price: 45 },
    { code: "CLOI-003", lot: "cloisons", name: "Enduit intérieur (projection)", unit: "m2", price: 28 },
    // Revêtements
    { code: "REV-001", lot: "revetements", name: "Carrelage sol (standard)", unit: "m2", price: 65 },
    { code: "REV-002", lot: "revetements", name: "Parquet stratifié", unit: "m2", price: 55 },
    { code: "REV-003", lot: "revetements", name: "Parquet massif chêne huilé", unit: "m2", price: 145 },
    { code: "REV-004", lot: "revetements", name: "Carrelage mural salle de bain", unit: "m2", price: 85 },
    { code: "REV-005", lot: "revetements", name: "Pierre naturelle (granit)", unit: "m2", price: 220 },
    { code: "REV-006", lot: "revetements", name: "Béton ciré sol", unit: "m2", price: 175 },
    { code: "REV-007", lot: "revetements", name: "Moquette (chambre)", unit: "m2", price: 42 },
    { code: "REV-008", lot: "revetements", name: "Résine époxy sol", unit: "m2", price: 95 },
    { code: "REV-009", lot: "revetements", name: "Marbre (sol ou mur)", unit: "m2", price: 320 },
    { code: "REV-010", lot: "revetements", name: "Carrelage grand format 120x120", unit: "m2", price: 115 },
    // Peinture
    { code: "PEIN-001", lot: "peinture", name: "Peinture intérieure (2 couches)", unit: "m2", price: 22 },
    { code: "PEIN-002", lot: "peinture", name: "Peinture lasure façade", unit: "m2", price: 38 },
    // Menuiseries int
    { code: "MINT-001", lot: "menuiseries_int", name: "Porte intérieure (standard)", unit: "u", price: 380 },
    { code: "MINT-002", lot: "menuiseries_int", name: "Porte intérieure (premium)", unit: "u", price: 750 },
    { code: "MINT-003", lot: "menuiseries_int", name: "Escalier bois standard", unit: "u", price: 4500 },
    { code: "MINT-004", lot: "menuiseries_int", name: "Escalier métal design", unit: "u", price: 12000 },
    { code: "MINT-005", lot: "menuiseries_int", name: "Porte coulissante galandage", unit: "u", price: 850 },
    { code: "MINT-006", lot: "menuiseries_int", name: "Porte accordéon / pliante", unit: "u", price: 620 },
    { code: "MINT-007", lot: "menuiseries_int", name: "Porte tierce (isolation phonique renforcée)", unit: "u", price: 1100 },
    { code: "MINT-008", lot: "menuiseries_int", name: "Habillage d'escalier (placage bois)", unit: "u", price: 3200 },
    { code: "MINT-009", lot: "menuiseries_int", name: "Placard sur mesure", unit: "u", price: 1800 },
    { code: "MINT-010", lot: "menuiseries_int", name: "Bibliothèque/dressing intégré", unit: "u", price: 2800 },
    { code: "MINT-011", lot: "menuiseries_int", name: "Paroi vitrée intérieure", unit: "u", price: 2200 },
    // Plomberie
    { code: "PLO-001", lot: "plomberie", name: "Installation complète salle de bain", unit: "u", price: 4500 },
    { code: "PLO-002", lot: "plomberie", name: "WC suspendu complet", unit: "u", price: 1200 },
    { code: "PLO-003", lot: "plomberie", name: "Cuisine (alimentation / évacuation)", unit: "u", price: 2200 },
    { code: "PLO-004", lot: "plomberie", name: "Réseau intérieur eau froide/chaude (m² SHAB)", unit: "m2", price: 55 },
    { code: "PLO-005", lot: "plomberie", name: "Douche italienne / à l'italienne", unit: "u", price: 2800 },
    { code: "PLO-006", lot: "plomberie", name: "Baignoire ilôt ou encastrée", unit: "u", price: 3500 },
    { code: "PLO-007", lot: "plomberie", name: "WC lavant (Japonais / bide intégré)", unit: "u", price: 2200 },
    { code: "PLO-008", lot: "plomberie", name: "Robinetterie premium (par pièce d'eau)", unit: "u", price: 800 },
    { code: "PLO-009", lot: "plomberie", name: "Chauffe-eau thermodynamique", unit: "u", price: 2400 },
    { code: "PLO-010", lot: "plomberie", name: "Adoucisseur d'eau", unit: "u", price: 1800 },
    { code: "PLO-011", lot: "plomberie", name: "Colonne de douche hydromassage", unit: "u", price: 1500 },
    { code: "PLO-012", lot: "plomberie", name: "Puits perdu / récupération eaux pluviales", unit: "u", price: 4500 },
    { code: "PLO-013", lot: "plomberie", name: "Bac à laver buanderie", unit: "u", price: 650 },
    { code: "PLO-014", lot: "plomberie", name: "Raccordements buanderie (machine à laver)", unit: "u", price: 450 },
    // Électricité
    { code: "ELEC-001", lot: "electricite", name: "Installation électrique (standard, m² SHAB)", unit: "m2", price: 85 },
    { code: "ELEC-002", lot: "electricite", name: "Installation électrique (premium)", unit: "m2", price: 130 },
    { code: "ELEC-003", lot: "electricite", name: "Tableau électrique + disjoncteurs", unit: "u", price: 2800 },
    { code: "ELEC-004", lot: "electricite", name: "Domotique (pack basic)", unit: "forfait", price: 3500 },
    { code: "ELEC-005", lot: "electricite", name: "Domotique avancée (KNX / Loxone)", unit: "forfait", price: 12000 },
    { code: "ELEC-006", lot: "electricite", name: "Borne de recharge VE (IRVE)", unit: "u", price: 1800 },
    { code: "ELEC-007", lot: "electricite", name: "Photovoltaïque (panneaux + onduleur)", unit: "kWc", price: 2200 },
    { code: "ELEC-008", lot: "electricite", name: "VMC électrique (extracteur)", unit: "u", price: 350 },
    { code: "ELEC-009", lot: "electricite", name: "Éclairage encastré (spot LED par pièce)", unit: "u", price: 280 },
    { code: "ELEC-010", lot: "electricite", name: "Réseau informatique / fibre intérieure", unit: "forfait", price: 1500 },
    { code: "ELEC-011", lot: "electricite", name: "Alarme intrusion", unit: "forfait", price: 2800 },
    { code: "ELEC-012", lot: "electricite", name: "Interphone / visiophone", unit: "u", price: 850 },
    // Chauffage / Ventilation
    { code: "CHAU-001", lot: "chauffage_ventilation", name: "Chaudière gaz condensation", unit: "u", price: 6500 },
    { code: "CHAU-002", lot: "chauffage_ventilation", name: "Pompe à chaleur air/eau", unit: "u", price: 14000 },
    { code: "CHAU-003", lot: "chauffage_ventilation", name: "VMC double flux", unit: "u", price: 4500 },
    { code: "CHAU-004", lot: "chauffage_ventilation", name: "VMC simple flux", unit: "u", price: 1800 },
    { code: "CHAU-005", lot: "chauffage_ventilation", name: "Radiateurs acier (m² SHAB)", unit: "m2", price: 35 },
    { code: "CHAU-006", lot: "chauffage_ventilation", name: "Plancher chauffant hydraulique", unit: "m2", price: 65 },
    // Ascenseur
    { code: "ASC-001", lot: "ascenseur", name: "Ascenseur hydraulique (4 arrêts)", unit: "u", price: 38000 },
    { code: "ASC-002", lot: "ascenseur", name: "Ascenseur électrique (6 arrêts)", unit: "u", price: 52000 },
    // VRD
    { code: "VRD-001", lot: "vrd", name: "Branchements réseaux (eau, élec, gaz, télécom)", unit: "forfait", price: 8500 },
    { code: "VRD-002", lot: "vrd", name: "Terrassements extérieurs / parking", unit: "m2", price: 45 },
    { code: "VRD-003", lot: "vrd", name: "Clôture + portail", unit: "ml", price: 280 },
    { code: "VRD-004", lot: "vrd", name: "Aménagement paysager (gazon + plantations)", unit: "m2", price: 35 },
    // Démolition
    { code: "DEMO-001", lot: "demolition", name: "Démolition cloisons légères", unit: "m2", price: 18 },
    { code: "DEMO-002", lot: "demolition", name: "Démolition structure béton/maçonnerie", unit: "m2", price: 55 },
    { code: "DEMO-003", lot: "demolition", name: "Évacuation gravats (benne)", unit: "m2", price: 12 },
    // Curage
    { code: "CUR-001", lot: "curage", name: "Curage complet (vide de l'existant)", unit: "m2", price: 35 },
    { code: "CUR-002", lot: "curage", name: "Désamiantage (diagnostic + travaux)", unit: "m2", price: 120 },
    // Reprises structurelles
    { code: "REP-001", lot: "reprises_structurelles", name: "Reprise en sous-œuvre (micropieux)", unit: "forfait", price: 25000 },
    { code: "REP-002", lot: "reprises_structurelles", name: "Renforcement plancher / poutrelles", unit: "forfait", price: 15000 },
    // Étanchéité
    { code: "ETA-001", lot: "etancheite", name: "Étanchéité soubassement (drainage + membrane)", unit: "m2", price: 85 },
    { code: "ETA-002", lot: "etancheite", name: "Étanchéité toiture-terrasse (bicouche)", unit: "m2", price: 92 },
    { code: "ETA-003", lot: "etancheite", name: "Cuvelage béton (sous-sol)", unit: "m2", price: 145 },
    // Installation de chantier
    { code: "IC-001", lot: "installation_chantier", name: "Installation de chantier (base)", unit: "forfait", price: 8000 },
    { code: "IC-002", lot: "installation_chantier", name: "Installation de chantier (urbain difficile)", unit: "forfait", price: 18000 },
    // Escalier
    { code: "ESC-001", lot: "escalier", name: "Escalier béton coulé en place", unit: "u", price: 5500 },
    { code: "ESC-002", lot: "escalier", name: "Escalier bois standard", unit: "u", price: 4500 },
    { code: "ESC-003", lot: "escalier", name: "Escalier métal design", unit: "u", price: 12000 },
    { code: "ESC-004", lot: "escalier", name: "Escalier marbre / pierre naturelle", unit: "u", price: 25000 },
    { code: "ESC-005", lot: "escalier", name: "Escalier bois en colimaçon", unit: "u", price: 7500 },
    { code: "ESC-006", lot: "escalier", name: "Escalier bois design (limon central)", unit: "u", price: 9500 },
    { code: "ESC-007", lot: "escalier", name: "Escalier métal laqué design", unit: "u", price: 16000 },
    { code: "ESC-008", lot: "escalier", name: "Escalier en béton ciré design", unit: "u", price: 18000 },
    { code: "ESC-009", lot: "escalier", name: "Escalier verre et métal (structure suspendue)", unit: "u", price: 28000 },
    // Cuisine
    { code: "CUIS-001", lot: "cuisine", name: "Cuisine équipée standard (jusqu'à 8 m²)", unit: "forfait", price: 8000 },
    { code: "CUIS-002", lot: "cuisine", name: "Cuisine équipée avec îlot central", unit: "forfait", price: 18000 },
    { code: "CUIS-003", lot: "cuisine", name: "Cuisine gourmet / chef (électros haut de gamme)", unit: "forfait", price: 35000 },
    { code: "CUIS-004", lot: "cuisine", name: "Cuisine compacte (studio / T1)", unit: "forfait", price: 4500 },
    { code: "CUIS-005", lot: "cuisine", name: "Crédence en verre laqué", unit: "forfait", price: 1200 },
    { code: "CUIS-006", lot: "cuisine", name: "Crédence en pierre naturelle / marbre", unit: "forfait", price: 2800 },
    // Buanderie
    { code: "BUAN-001", lot: "buanderie", name: "Buanderie équipée (bac + raccordements)", unit: "forfait", price: 2500 },
    // Cellier
    { code: "CELL-001", lot: "cellier", name: "Cellier simple (rayonnages basiques)", unit: "forfait", price: 1200 },
    { code: "CELL-002", lot: "cellier", name: "Cellier équipé (étagères + cave à vin)", unit: "forfait", price: 3500 },
    // Pompe à chaleur
    { code: "PAC-001", lot: "heat_pump", name: "PAC air/eau (jusqu'à 120 m²)", unit: "u", price: 14000 },
    { code: "PAC-002", lot: "heat_pump", name: "PAC air/eau haute puissance (120-250 m²)", unit: "u", price: 22000 },
    { code: "PAC-003", lot: "heat_pump", name: "PAC géothermique", unit: "u", price: 32000 },
    // Chauffage électrique
    { code: "ELCH-001", lot: "electric_heating", name: "Radiateurs à inertie électriques", unit: "m2", price: 55 },
    { code: "ELCH-002", lot: "electric_heating", name: "Plancher chauffant électrique", unit: "m2", price: 75 },
    // VMC double flux
    { code: "VMC-001", lot: "double_flux", name: "VMC double flux résidentielle (jusqu'à 150 m²)", unit: "u", price: 4500 },
    { code: "VMC-002", lot: "double_flux", name: "VMC double flux haute performance (150-300 m²)", unit: "u", price: 7500 },
  ];

  for (const item of priceItems) {
    const lotId = lotMap[item.lot];
    if (!lotId) continue;
    await prisma.priceItem.upsert({
      where: { itemCode: item.code },
      update: { basePriceHt: item.price },
      create: {
        itemCode: item.code,
        costLotId: lotId,
        referenceName: item.name,
        unit: item.unit,
        basePriceHt: item.price,
        countryId: france.id,
        confidenceLevel: "medium",
        sourceType: "internal",
      },
    });
  }

  // ─── REGIONAL COEFFICIENTS ────────────────────────────────────────────────
  const regionalCoefs = [
    { region: "IDF", coef: 1.28 },
    { region: "PACA", coef: 1.12 },
    { region: "ARA", coef: 1.06 },
    { region: "OCC", coef: 1.00 },
    { region: "NAQ", coef: 0.97 },
    { region: "BFC", coef: 0.94 },
    { region: "HDF", coef: 0.96 },
    { region: "GES", coef: 0.95 },
    { region: "NOR", coef: 0.96 },
    { region: "BRE", coef: 0.95 },
    { region: "PDL", coef: 0.97 },
    { region: "CVL", coef: 0.95 },
  ];
  for (const rc of regionalCoefs) {
    const regionId = regionMap[rc.region];
    if (!regionId) continue;
    await prisma.regionalCoefficient.upsert({
      where: { id: `rc_${rc.region}_global` },
      update: { coefficient: rc.coef },
      create: { id: `rc_${rc.region}_global`, countryId: france.id, regionId, coefficient: rc.coef },
    });
  }

  // ─── QUALITY COEFFICIENTS ─────────────────────────────────────────────────
  const qcData = [
    { fl: flStandard, coef: 1.0 },
    { fl: flPremium, coef: 1.25 },
    { fl: flLuxury, coef: 1.55 },
  ];
  for (const q of qcData) {
    await prisma.qualityCoefficient.upsert({
      where: { id: `qc_${q.fl.id}_global` },
      update: { coefficient: q.coef },
      create: { id: `qc_${q.fl.id}_global`, finishLevelId: q.fl.id, coefficient: q.coef },
    });
  }

  // ─── COMPLEXITY COEFFICIENTS ──────────────────────────────────────────────
  const complexityData: Array<[string, number]> = [["simple", 0.92], ["standard", 1.0], ["complex", 1.18]];
  for (const [code, coef] of complexityData) {
    await prisma.complexityCoefficient.upsert({
      where: { id: `cc_${code}_global` },
      update: { coefficient: coef },
      create: { id: `cc_${code}_global`, complexityCode: code, coefficient: coef },
    });
  }

  // ─── MARKET INDICES ───────────────────────────────────────────────────────
  const indices = [
    { code: "BT01", label: "BT01 - Gros œuvre", value: 128.4 },
    { code: "BT02", label: "BT02 - Maçonnerie", value: 125.1 },
    { code: "BT50", label: "BT50 - Électricité", value: 131.8 },
    { code: "BT54", label: "BT54 - Plomberie", value: 127.3 },
    { code: "ICC", label: "ICC - Indice du coût de la construction", value: 2042.0 },
  ];
  for (const idx of indices) {
    await prisma.marketIndex.upsert({
      where: { id: `mi_${idx.code}_2024Q4` },
      update: { value: idx.value },
      create: {
        id: `mi_${idx.code}_2024Q4`,
        countryId: france.id,
        code: idx.code,
        label: idx.label,
        periodDate: new Date("2024-10-01"),
        value: idx.value,
        publishedAt: new Date("2025-01-15"),
        sourceUrl: "https://www.insee.fr/fr/statistiques",
      },
    });
  }

  // ─── CALCULATION RULES (v2 — conditionJson / actionJson) ─────────────────
  const rulesV2 = [
    {
      code: "RULE_REGION_IDF",
      labelFr: "Coefficient régional Île-de-France",
      labelTr: "Île-de-France bölgesel katsayı",
      type: "condition", priority: 100, regionScope: "IDF",
      conditionJson: JSON.stringify({ region: "IDF" }),
      actionJson: JSON.stringify({ set_region_coef: 1.28, apply_on: "travaux_ht_only" }),
    },
    {
      code: "RULE_REGION_MAJOR_CITY",
      labelFr: "Coefficient régional grande ville",
      labelTr: "Büyük şehir bölgesel katsayı",
      type: "condition", priority: 110, regionScope: "major_city",
      conditionJson: JSON.stringify({ region_type: "major_city" }),
      actionJson: JSON.stringify({ set_region_coef: 1.12, apply_on: "travaux_ht_only" }),
    },
    {
      code: "RULE_PROJECT_NEW_BUILD",
      labelFr: "Contrôle des lots obligatoires pour construction neuve",
      labelTr: "Yeni yapı zorunlu lot kontrolü",
      type: "condition", priority: 200, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type: "new_build" }),
      actionJson: JSON.stringify({ require_lots: ["terrassement","fondations","gros_oeuvre_structure","charpente","couverture","menuiseries_ext","isolation","cloisons","revetements","peinture","electricite","plomberie","chauffage_ventilation","vrd"] }),
    },
    {
      code: "RULE_RENOV_LIGHT",
      labelFr: "Provision pour rénovation légère",
      labelTr: "Hafif renovasyon risk payı",
      type: "condition", priority: 210, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type: "light_renovation" }),
      actionJson: JSON.stringify({ increase_contingency: 0.05 }),
    },
    {
      code: "RULE_RENOV_HEAVY",
      labelFr: "Provision et activation des lots pour rénovation lourde",
      labelTr: "Ağır renovasyon risk ve ek lot aktivasyonu",
      type: "condition", priority: 220, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type: "heavy_renovation" }),
      actionJson: JSON.stringify({ increase_contingency: 0.15, activate_lots: ["demolition","curage","reprises_structurelles"] }),
    },
    {
      code: "RULE_RENOV_HEAVY_OLD_BUILDING",
      labelFr: "Risque supplémentaire pour rénovation lourde bâtiment ancien",
      labelTr: "Eski yapı ağır renovasyon ek riski",
      type: "condition", priority: 230, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type: "heavy_renovation", building_age: "pre_1948" }),
      actionJson: JSON.stringify({ increase_contingency: 0.20 }),
    },
    {
      code: "RULE_MIN_TECHNICAL_LOTS",
      labelFr: "Lots techniques minimum obligatoires",
      labelTr: "Minimum teknik lot zorunluluğu",
      type: "condition", priority: 300, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type_in: ["new_build","light_renovation","heavy_renovation"] }),
      actionJson: JSON.stringify({ require_lots: ["electricite","plomberie"] }),
    },
    {
      code: "RULE_HEATING_REQUIRED",
      labelFr: "Système de chauffage obligatoire",
      labelTr: "Isıtma sistemi zorunluluğu",
      type: "condition", priority: 310, regionScope: "ALL",
      conditionJson: JSON.stringify({ heated_area_m2_gt: 20 }),
      actionJson: JSON.stringify({ require_one_of_lots: ["chauffage_ventilation","heat_pump","electric_heating"] }),
    },
    {
      code: "RULE_BATHROOM_PLUMBING",
      labelFr: "Plomberie obligatoire s'il y a une salle de bain",
      labelTr: "Banyo varsa sıhhi tesisat zorunlu",
      type: "condition", priority: 320, regionScope: "ALL",
      conditionJson: JSON.stringify({ bathroom_count_gt: 0 }),
      actionJson: JSON.stringify({ require_lots: ["plomberie"] }),
    },
    {
      code: "RULE_KITCHEN_CONNECTIONS",
      labelFr: "Plomberie et électricité obligatoires s'il y a une cuisine",
      labelTr: "Mutfak varsa su ve elektrik zorunlu",
      type: "condition", priority: 330, regionScope: "ALL",
      conditionJson: JSON.stringify({ kitchen: true }),
      actionJson: JSON.stringify({ require_lots: ["plomberie","electricite"] }),
    },
    {
      code: "RULE_BASEMENT_IMPACT",
      labelFr: "Impact du sous-sol sur les coûts",
      labelTr: "Bodrum kat maliyet etkisi",
      type: "condition", priority: 400, regionScope: "ALL",
      conditionJson: JSON.stringify({ has_basement: true }),
      actionJson: JSON.stringify({ increase_coef: { terrassement: 1.35, fondations: 1.25, gros_oeuvre_structure: 1.15, etancheite: 1.40, vrd: 1.10 } }),
    },
    {
      code: "RULE_ELEVATOR_4_FLOORS",
      labelFr: "Activation de l'ascenseur à partir de 4 niveaux",
      labelTr: "4+ katta asansör aktivasyonu",
      type: "trigger", priority: 410, regionScope: "ALL",
      conditionJson: JSON.stringify({ floors_gte: 4 }),
      actionJson: JSON.stringify({ activate_lots: ["ascenseur"] }),
    },
    {
      code: "RULE_STRUCTURE_HEIGHT",
      labelFr: "Majoration structure selon le nombre de niveaux",
      labelTr: "Kat sayısına göre taşıyıcı artış",
      type: "condition", priority: 420, regionScope: "ALL",
      conditionJson: JSON.stringify({ floors_gte: 3 }),
      actionJson: JSON.stringify({ increase_coef: { gros_oeuvre_structure: 1.10, fondations: 1.08 } }),
    },
    {
      code: "RULE_RE2020_PACKAGE_REQUIRED",
      labelFr: "Sélection obligatoire d'un pack RE2020",
      labelTr: "RE2020 enerji paketi seçimi zorunlu",
      type: "condition", priority: 500, regionScope: "ALL",
      conditionJson: JSON.stringify({ project_type: "new_build", country: "FR" }),
      actionJson: JSON.stringify({ require_selection: ["energy_package"] }),
    },
    {
      code: "RULE_RE2020_STANDARD",
      labelFr: "Impact du pack énergie RE2020 standard",
      labelTr: "RE2020 standart enerji paketi etkisi",
      type: "condition", priority: 510, regionScope: "ALL",
      conditionJson: JSON.stringify({ energy_package: "RE2020_standard" }),
      actionJson: JSON.stringify({ increase_coef: { isolation: 1.12, menuiseries_ext: 1.08, chauffage_ventilation: 1.15 } }),
    },
    {
      code: "RULE_RE2020_ADVANCED",
      labelFr: "Impact du pack énergie RE2020 avancé",
      labelTr: "RE2020 gelişmiş enerji paketi etkisi",
      type: "condition", priority: 520, regionScope: "ALL",
      conditionJson: JSON.stringify({ energy_package: "RE2020_advanced" }),
      actionJson: JSON.stringify({ increase_coef: { isolation: 1.18, menuiseries_ext: 1.12, chauffage_ventilation: 1.20 }, activate_lots: ["heat_pump","double_flux"] }),
    },
    {
      code: "RULE_PREMIUM_FINISH",
      labelFr: "Niveau de finition premium",
      labelTr: "Premium bitiş seviyesi",
      type: "condition", priority: 600, regionScope: "ALL",
      conditionJson: JSON.stringify({ finish_level: "premium" }),
      actionJson: JSON.stringify({ increase_coef: { revetements: 1.30, menuiseries_int: 1.20, menuiseries_ext: 1.15, plomberie: 1.20, electricite: 1.10, peinture: 1.10 } }),
    },
    {
      code: "RULE_LUXURY_FINISH",
      labelFr: "Niveau de finition luxe",
      labelTr: "Luxury bitiş seviyesi",
      type: "condition", priority: 610, regionScope: "ALL",
      conditionJson: JSON.stringify({ finish_level: "luxury" }),
      actionJson: JSON.stringify({ increase_coef: { revetements: 1.65, menuiseries_int: 1.50, menuiseries_ext: 1.35, plomberie: 1.40, electricite: 1.25, peinture: 1.20, escalier: 1.35 } }),
    },
    {
      code: "RULE_SMALL_SURFACE",
      labelFr: "Majoration pour petite surface",
      labelTr: "Küçük proje maliyet artışı",
      type: "condition", priority: 700, regionScope: "ALL",
      conditionJson: JSON.stringify({ surface_m2_lt: 80 }),
      actionJson: JSON.stringify({ increase_global_coef: 1.20, apply_on: "travaux_ht_only" }),
    },
    {
      code: "RULE_MEDIUM_SURFACE",
      labelFr: "Ajustement pour surface moyenne",
      labelTr: "Orta ölçek proje düzeltmesi",
      type: "condition", priority: 710, regionScope: "ALL",
      conditionJson: JSON.stringify({ surface_m2_gte: 80, surface_m2_lte: 150 }),
      actionJson: JSON.stringify({ increase_global_coef: 1.00, apply_on: "travaux_ht_only" }),
    },
    {
      code: "RULE_LARGE_SURFACE",
      labelFr: "Avantage d'échelle pour grande surface",
      labelTr: "Büyük proje ölçek avantajı",
      type: "condition", priority: 720, regionScope: "ALL",
      conditionJson: JSON.stringify({ surface_m2_gt: 150 }),
      actionJson: JSON.stringify({ decrease_global_coef: 0.05, apply_on: "travaux_ht_only" }),
    },
    {
      code: "RULE_DENSE_URBAN_SITE",
      labelFr: "Impact d'un site urbain dense",
      labelTr: "Yoğun kentsel alan etkisi",
      type: "condition", priority: 800, regionScope: "ALL",
      conditionJson: JSON.stringify({ site_access: "difficult" }),
      actionJson: JSON.stringify({ increase_coef: { terrassement: 1.15, gros_oeuvre_structure: 1.08, vrd: 1.10 }, increase_contingency: 0.03 }),
    },
    {
      code: "RULE_VERY_DIFFICULT_ACCESS",
      labelFr: "Impact d'un accès chantier très difficile",
      labelTr: "Çok zor saha erişimi etkisi",
      type: "condition", priority: 810, regionScope: "ALL",
      conditionJson: JSON.stringify({ site_access: "very_difficult" }),
      actionJson: JSON.stringify({ increase_coef: { terrassement: 1.25, gros_oeuvre_structure: 1.12, vrd: 1.15, installation_chantier: 1.20 }, increase_contingency: 0.05 }),
    },
    {
      code: "RULE_CONFIDENCE_ADVANCED",
      labelFr: "Niveau de confiance avancé",
      labelTr: "Yüksek güven seviyesi",
      type: "condition", priority: 900, regionScope: "ALL",
      conditionJson: JSON.stringify({ required_lots_completed_pct_gte: 90, project_inputs_completed_pct_gte: 85, technical_lots_present: true }),
      actionJson: JSON.stringify({ set_confidence: "avance" }),
    },
    {
      code: "RULE_CONFIDENCE_MEDIUM",
      labelFr: "Niveau de confiance moyen",
      labelTr: "Orta güven seviyesi",
      type: "condition", priority: 910, regionScope: "ALL",
      conditionJson: JSON.stringify({ required_lots_completed_pct_gte: 65, project_inputs_completed_pct_gte: 60 }),
      actionJson: JSON.stringify({ set_confidence: "affine" }),
    },
    {
      code: "RULE_CONFIDENCE_LOW",
      labelFr: "Niveau de confiance bas",
      labelTr: "Düşük güven seviyesi",
      type: "default", priority: 920, regionScope: "ALL",
      conditionJson: JSON.stringify({}),
      actionJson: JSON.stringify({ set_confidence: "indicatif" }),
    },
  ];

  for (const r of rulesV2) {
    await prisma.calculationRule.upsert({
      where: { ruleCode: r.code },
      update: {
        labelFr: r.labelFr,
        labelTr: r.labelTr,
        ruleType: r.type,
        priority: r.priority,
        regionScope: r.regionScope,
        conditionJson: r.conditionJson,
        actionJson: r.actionJson,
        isActive: true,
      },
      create: {
        ruleCode: r.code,
        name: r.labelFr,
        labelFr: r.labelFr,
        labelTr: r.labelTr,
        ruleType: r.type,
        priority: r.priority,
        regionScope: r.regionScope,
        conditionJson: r.conditionJson,
        actionJson: r.actionJson,
        countryId: france.id,
        isActive: true,
      },
    });
  }

  // ─── DEMO USER & COMPANY ──────────────────────────────────────────────────
  const demoCompany = await prisma.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: {
      id: "demo-company",
      legalName: "ÉLAN Architecture SARL",
      brandName: "ÉLAN Architecture",
      countryCode: "FR",
      currencyCode: "EUR",
      defaultLanguage: "fr",
    },
  });

  const adminPassword = resolveAdminPassword();
  const adminHash = await hashPassword(adminPassword);
  // update: {} — never overwrite an already-changed password in production
  await prisma.user.upsert({
    where: { email: "admin@elan-architecture.fr" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "ÉLAN",
      email: "admin@elan-architecture.fr",
      passwordHash: adminHash,
      role: "admin",
      preferredLanguage: "fr",
      companyId: demoCompany.id,
    },
  });

  const estPassword = process.env.SEED_ESTIMATOR_PASSWORD ?? "estimator123-dev-only";
  const estHash = await hashPassword(estPassword);
  await prisma.user.upsert({
    where: { email: "estimator@elan-architecture.fr" },
    update: {},
    create: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "estimator@elan-architecture.fr",
      passwordHash: estHash,
      role: "estimator",
      preferredLanguage: "fr",
      companyId: demoCompany.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  if (process.env.NODE_ENV !== "production") {
    console.log("   Admin: admin@elan-architecture.fr / admin123-dev-only");
    console.log("   Estimator: estimator@elan-architecture.fr / estimator123-dev-only");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
