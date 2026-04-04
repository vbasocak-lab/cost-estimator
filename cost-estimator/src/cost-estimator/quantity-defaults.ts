import type { LotCode, ProjectInput, Unit } from "./types";

export function uniqueLots(lots: LotCode[]): LotCode[] {
  return [...new Set(lots)];
}

export function getDefaultQuantity(project: ProjectInput, lotCode: LotCode, unit: Unit): number {
  const surface = project.surface_m2;
  const defaults: Partial<Record<LotCode, number>> = {
    terrassement: surface * 0.75,
    fondations: surface * 0.2,
    structure: surface,
    charpente: surface * 0.65,
    couverture: surface * 0.65,
    etancheite: surface * 0.2,
    menuiseries_exterieures: Math.max(4, Math.round(surface / 12)),
    menuiseries_interieures: Math.max(4, Math.round(surface / 18)),
    isolation: surface * 1.7,
    cloisons: surface * 1.4,
    revetements: surface,
    peinture: surface * 2.8,
    plomberie: 1,
    electricite: surface,
    chauffage: 1,
    ventilation: 1,
    vrd: 1,
    ascenseur: 1,
    demolition: surface,
    curage: surface,
    reprises_structurelles: surface * 0.35,
    heat_pump: 1,
    double_flux: 1,
    escalier: project.floors >= 2 ? 1 : 0,
  };

  const quantity = project.quantities?.[lotCode] ?? defaults[lotCode];
  if (quantity !== undefined) return quantity;
  return unit === "forfait" ? 1 : 0;
}

export function getBaseActiveLots(project: ProjectInput): LotCode[] {
  const base: LotCode[] = [];

  if (project.project_type === "new_build") {
    base.push(
      "terrassement",
      "fondations",
      "structure",
      "charpente",
      "couverture",
      "menuiseries_exterieures",
      "isolation",
      "cloisons",
      "revetements",
      "peinture",
      "electricite",
      "plomberie",
      "chauffage",
      "ventilation",
      "vrd"
    );
  }

  if (project.project_type === "light_renovation") {
    base.push(
      "menuiseries_exterieures",
      "isolation",
      "cloisons",
      "revetements",
      "peinture",
      "electricite",
      "plomberie",
      "chauffage"
    );
  }

  if (project.project_type === "heavy_renovation") {
    base.push(
      "demolition",
      "curage",
      "reprises_structurelles",
      "structure",
      "menuiseries_exterieures",
      "isolation",
      "cloisons",
      "revetements",
      "peinture",
      "electricite",
      "plomberie",
      "chauffage",
      "ventilation"
    );
  }

  return uniqueLots(base);
}
