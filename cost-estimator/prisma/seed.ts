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
    // Charpente
    { code: "CHARP-001", lot: "charpente", name: "Charpente traditionnelle bois", unit: "m2", price: 85 },
    { code: "CHARP-002", lot: "charpente", name: "Charpente industrielle (fermettes)", unit: "m2", price: 55 },
    { code: "CHARP-003", lot: "charpente", name: "Ossature bois (CLT/Glulam)", unit: "m2", price: 145 },
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
    // Peinture
    { code: "PEIN-001", lot: "peinture", name: "Peinture intérieure (2 couches)", unit: "m2", price: 22 },
    { code: "PEIN-002", lot: "peinture", name: "Peinture lasure façade", unit: "m2", price: 38 },
    // Menuiseries int
    { code: "MINT-001", lot: "menuiseries_int", name: "Porte intérieure (standard)", unit: "u", price: 380 },
    { code: "MINT-002", lot: "menuiseries_int", name: "Porte intérieure (premium)", unit: "u", price: 750 },
    { code: "MINT-003", lot: "menuiseries_int", name: "Escalier bois standard", unit: "u", price: 4500 },
    { code: "MINT-004", lot: "menuiseries_int", name: "Escalier métal design", unit: "u", price: 12000 },
    // Plomberie
    { code: "PLO-001", lot: "plomberie", name: "Installation complète salle de bain", unit: "u", price: 4500 },
    { code: "PLO-002", lot: "plomberie", name: "WC suspendu complet", unit: "u", price: 1200 },
    { code: "PLO-003", lot: "plomberie", name: "Cuisine (alimentation / évacuation)", unit: "u", price: 2200 },
    { code: "PLO-004", lot: "plomberie", name: "Réseau intérieur eau froide/chaude (m² SHAB)", unit: "m2", price: 55 },
    // Électricité
    { code: "ELEC-001", lot: "electricite", name: "Installation électrique (standard, m² SHAB)", unit: "m2", price: 85 },
    { code: "ELEC-002", lot: "electricite", name: "Installation électrique (premium)", unit: "m2", price: 130 },
    { code: "ELEC-003", lot: "electricite", name: "Tableau électrique + disjoncteurs", unit: "u", price: 2800 },
    { code: "ELEC-004", lot: "electricite", name: "Domotique (pack basic)", unit: "forfait", price: 3500 },
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

  // ─── CALCULATION RULES ────────────────────────────────────────────────────
  const rules = [
    {
      code: "RULE_ELEVATOR",
      name: "Asansör aktivasyonu (4+ kat)",
      type: "trigger",
      conditions: [{ field: "floorsAboveGround", op: "gte", val: "4" }],
      output: "activate_lot:ascenseur",
    },
    {
      code: "RULE_BASEMENT",
      name: "Bodrum katsayı artışı",
      type: "condition",
      conditions: [{ field: "floorsBelowGround", op: "gte", val: "1" }],
      output: "increase_coef:terrassement:1.35",
    },
    {
      code: "RULE_HEAVY_RENOVATION",
      name: "Ağır renovasyon ek lotlar",
      type: "trigger",
      conditions: [
        { field: "projectType", op: "eq", val: "renovation" },
        { field: "renovationScope", op: "eq", val: "heavy" },
      ],
      output: "increase_contingency:0.05",
    },
    {
      code: "RULE_RE2020",
      name: "RE2020 enerji paketi zorunluluğu",
      type: "condition",
      conditions: [
        { field: "projectType", op: "eq", val: "new_build" },
        { field: "energyStandard", op: "eq", val: "re2020" },
      ],
      output: "require_selection:energyPackage",
    },
    {
      code: "RULE_IDF_COEFFICIENT",
      name: "Île-de-France bölgesel katsayı",
      type: "condition",
      conditions: [{ field: "regionCode", op: "eq", val: "IDF" }],
      output: "set_region_coef:1.28",
    },
    {
      code: "RULE_PREMIUM_FINISH",
      name: "Premium bitiş artışı",
      type: "condition",
      conditions: [{ field: "finishLevel", op: "eq", val: "premium" }],
      output: "increase_coef:revetements:1.30",
    },
    {
      code: "RULE_LUXURY_FINISH",
      name: "Luxury bitiş artışı",
      type: "condition",
      conditions: [{ field: "finishLevel", op: "eq", val: "luxury" }],
      output: "increase_coef:revetements:1.65",
    },
  ];

  for (const r of rules) {
    const rule = await prisma.calculationRule.upsert({
      where: { ruleCode: r.code },
      update: { name: r.name },
      create: {
        ruleCode: r.code,
        name: r.name,
        ruleType: r.type,
        outputTarget: r.output,
        countryId: france.id,
        isActive: true,
      },
    });
    for (const cond of r.conditions) {
      await prisma.ruleCondition.upsert({
        where: { id: `rc_${r.code}_${cond.field}_${cond.val}` },
        update: { compareValue: cond.val },
        create: {
          id: `rc_${r.code}_${cond.field}_${cond.val}`,
          ruleId: rule.id,
          fieldName: cond.field,
          operator: cond.op,
          compareValue: cond.val,
        },
      });
    }
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
