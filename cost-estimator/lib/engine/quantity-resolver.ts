/**
 * quantity-resolver.ts
 * Resolves quantities for article codes based on lot type and project parameters.
 * Replaces legacy quantityResolver.ts for new dynamic mapping engine.
 */

export type QuantityMode = "m2_shon" | "m2_shab" | "unit" | "forfait" | "ratio_shon" | "ratio_shab";

export interface QuantityParams {
  surfaceShonM2: number;
  surfaceShabM2: number;
  bathroomCount: number;
  wcCount: number;
  bedroomCount: number;
  roomCount: number;
  interiorDoorCount: number;
  aboveGroundFloors: number;
  basementFloors: number;
}

/**
 * Resolve quantity for a specific article code based on mode and parameters.
 */
export function resolveQuantity(
  mode: QuantityMode,
  params: QuantityParams,
  code: string,
  fixedValue?: number
): number {
  const { surfaceShonM2, surfaceShabM2, bathroomCount, wcCount } = params;

  switch (mode) {
    case "m2_shon":
      return surfaceShonM2;
    case "m2_shab":
      return surfaceShabM2;
    case "unit":
      return fixedValue ?? 1;
    case "forfait":
      return 1;
    case "ratio_shon":
      return surfaceShonM2 * (fixedValue ?? 1);
    case "ratio_shab":
      return surfaceShabM2 * (fixedValue ?? 1);
    default:
      return resolveByCodePrefix(code, params, fixedValue);
  }
}

/**
 * Auto-detect quantity mode from article code prefix.
 */
export function resolveByCodePrefix(
  code: string,
  params: QuantityParams,
  fixedValue?: number
): number {
  const { surfaceShonM2, surfaceShabM2, bathroomCount, wcCount, interiorDoorCount } = params;
  const prefix = code.split("-")[0];

  switch (prefix) {
    case "TERR":
      return surfaceShonM2 * 0.3;
    case "FOND":
      if (code === "FOND-003") return surfaceShonM2;
      return surfaceShonM2 * 0.15;
    case "GO":
      return surfaceShonM2;
    case "CHARP":
      return surfaceShonM2;
    case "COUV":
      return surfaceShonM2 * 1.1;
    case "MEXT":
      return fixedValue ?? Math.round(surfaceShonM2 / 20);
    case "ISO":
      return surfaceShonM2;
    case "CLOI":
      return surfaceShabM2 * 0.7;
    case "REV":
      return surfaceShabM2;
    case "PEIN":
      return surfaceShabM2 * 3.5;
    case "MINT":
      return fixedValue ?? interiorDoorCount;
    case "ESC":
      return 1;
    case "PLO":
      if (code === "PLO-004") return surfaceShabM2;
      if (code === "PLO-001" || code === "PLO-005" || code === "PLO-006") return bathroomCount || 1;
      if (code === "PLO-002") return wcCount || 1;
      return 1;
    case "ELEC":
      if (code === "ELEC-001" || code === "ELEC-002") return surfaceShabM2;
      return 1;
    case "CHAU":
      if (code === "CHAU-005" || code === "CHAU-006") return surfaceShabM2;
      return 1;
    case "PAC":
    case "VMC":
    case "ASC":
    case "IC":
    case "VRD":
    case "CUIS":
    case "BUAN":
    case "CELL":
      return 1;
    case "ELCH":
      return surfaceShabM2;
    default:
      return fixedValue ?? 1;
  }
}

/**
 * Get the best unit label for a given code prefix.
 */
export function getUnitForCode(code: string): string {
  const prefix = code.split("-")[0];
  const unitMap: Record<string, string> = {
    TERR: "m3", FOND: "m2", GO: "m2", CHARP: "m2", COUV: "m2",
    MEXT: "u", ISO: "m2", CLOI: "m2", REV: "m2", PEIN: "m2",
    MINT: "u", ESC: "u", PLO: "u", ELEC: "m2", CHAU: "m2",
    PAC: "u", VMC: "u", ASC: "u", IC: "forfait", VRD: "forfait",
    CUIS: "forfait", BUAN: "forfait", CELL: "forfait", ELCH: "m2",
  };
  return unitMap[prefix] || "forfait";
}
