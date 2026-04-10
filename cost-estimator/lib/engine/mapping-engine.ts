/**
 * mapping-engine.ts
 * Transforms project input selections into active article/code lists per lot.
 * This is the core of the dynamic lot-based configurator.
 */

import { PrismaClient } from "@prisma/client";

export interface MappingInput {
  // Surface
  surfaceShonM2: number;
  surfaceShabM2: number;
  aboveGroundFloors: number;
  basementFloors: number;
  // Building
  buildingUsage: string;
  structureType: string;
  facadeComplexity: string;
  roofType: string;
  // Energy / HVAC
  energyStandard: string;
  heatingSystem: string;
  heatingDistribution: string;
  ventilationType: string;
  electricLevel: string;
  elevatorRequired: boolean;
  // Windows
  windowGlazingType: string;
  windowFrameType: string;
  windowOpeningType: string;
  windowAreaRatio: number;
  roofWindowCount: number;
  // Interior doors
  interiorDoorCount: number;
  interiorDoorType: string;
  // Stairs
  hasStair: boolean;
  stairType: string;
  stairFinish: string;
  // Bathrooms
  bathroomCount: number;
  bathroomLevel: string;
  bathroomType: string;
  showerType: string;
  vanityType: string;
  wcCount: number;
  wcType: string;
  bathtubType: string;
  // Kitchen
  kitchenType: string;
  kitchenCredenceType: string;
  // Extra rooms
  hasBuanderie: boolean;
  hasCellier: boolean;
  cellierStorageLevel: string;
  // Finish
  finishLevel: string;
}

export interface LotActivation {
  lotCode: string;
  articleCodes: string[];
  quantities: Record<string, number>;
  notes?: string;
}

/**
 * Build active article list from project inputs.
 * Uses static rules + PriceCodeMapping table for overrides.
 */
export async function generateActiveCodeList(
  input: MappingInput,
  prisma: PrismaClient
): Promise<LotActivation[]> {
  const activations: LotActivation[] = [];
  const shon = input.surfaceShonM2 || 100;
  const shab = input.surfaceShabM2 || shon * 0.85;

  // ─── 1. STRUCTURE / GROS OEUVRE ──────────────────────────────────────────
  const structureCodes = resolveStructureCodes(input.structureType, shon);
  activations.push({
    lotCode: "gros_oeuvre_structure",
    articleCodes: structureCodes.codes,
    quantities: structureCodes.quantities,
  });

  // ─── 2. CHARPENTE ────────────────────────────────────────────────────────
  const charpenteCodes = resolveCharpenteCodes(input.structureType, input.roofType, shon);
  activations.push({
    lotCode: "charpente",
    articleCodes: charpenteCodes.codes,
    quantities: charpenteCodes.quantities,
  });

  // ─── 3. COUVERTURE ───────────────────────────────────────────────────────
  const couvertureCodes = resolveCouvertureCodes(input.roofType, shon);
  activations.push({
    lotCode: "couverture",
    articleCodes: couvertureCodes.codes,
    quantities: couvertureCodes.quantities,
  });

  // ─── 4. MENUISERIES EXTÉRIEURES (Windows) ────────────────────────────────
  const windowCount = Math.max(4, Math.round(shon * input.windowAreaRatio / 1.5));
  const windowCodes = resolveWindowCodes(input.windowGlazingType, input.windowFrameType, input.windowOpeningType, windowCount, input.roofWindowCount);
  activations.push({
    lotCode: "menuiseries_ext",
    articleCodes: windowCodes.codes,
    quantities: windowCodes.quantities,
  });

  // ─── 5. ISOLATION ────────────────────────────────────────────────────────
  activations.push({
    lotCode: "isolation",
    articleCodes: ["ISO-001", "ISO-003"],
    quantities: { "ISO-001": shon, "ISO-003": shon * 0.8 },
  });

  // ─── 6. CLOISONS / PLATRERIE ─────────────────────────────────────────────
  activations.push({
    lotCode: "cloisons",
    articleCodes: ["CLOI-001", "CLOI-002"],
    quantities: { "CLOI-001": shab * 0.7, "CLOI-002": shab * 0.5 },
  });

  // ─── 7. MENUISERIES INTÉRIEURES (Doors) ──────────────────────────────────
  const doorCodes = resolveInteriorDoorCodes(input.interiorDoorType, input.interiorDoorCount);
  activations.push({
    lotCode: "menuiseries_int",
    articleCodes: doorCodes.codes,
    quantities: doorCodes.quantities,
  });

  // ─── 8. ESCALIER ─────────────────────────────────────────────────────────
  if (input.hasStair) {
    const stairCodes = resolveStairCodes(input.stairType, input.stairFinish);
    activations.push({
      lotCode: "escalier",
      articleCodes: stairCodes.codes,
      quantities: stairCodes.quantities,
    });
  }

  // ─── 9. REVÊTEMENTS ──────────────────────────────────────────────────────
  const revCodes = resolveRevCodes(input.finishLevel, shab, input.bathroomCount, input.wcCount);
  activations.push({
    lotCode: "revetements",
    articleCodes: revCodes.codes,
    quantities: revCodes.quantities,
  });

  // ─── 10. PEINTURE ────────────────────────────────────────────────────────
  activations.push({
    lotCode: "peinture",
    articleCodes: ["PEIN-001"],
    quantities: { "PEIN-001": shab * 3.5 }, // walls + ceiling
  });

  // ─── 11. PLOMBERIE ───────────────────────────────────────────────────────
  const ploCodes = resolvePlomberieCodes(input.bathroomCount, input.wcCount, input.bathroomType, input.showerType, shab);
  activations.push({
    lotCode: "plomberie",
    articleCodes: ploCodes.codes,
    quantities: ploCodes.quantities,
  });

  // ─── 12. ÉLECTRICITÉ ─────────────────────────────────────────────────────
  const elecCodes = resolveElecCodes(input.electricLevel, shab, input.bathroomCount);
  activations.push({
    lotCode: "electricite",
    articleCodes: elecCodes.codes,
    quantities: elecCodes.quantities,
  });

  // ─── 13. CHAUFFAGE / VENTILATION ─────────────────────────────────────────
  const heatingCodes = resolveHeatingCodes(input.heatingSystem, input.heatingDistribution, input.ventilationType, shab);
  activations.push({
    lotCode: "chauffage_ventilation",
    articleCodes: heatingCodes.codes,
    quantities: heatingCodes.quantities,
  });

  // ─── 14. ASCENSEUR ───────────────────────────────────────────────────────
  if (input.elevatorRequired) {
    const floors = input.aboveGroundFloors;
    activations.push({
      lotCode: "ascenseur",
      articleCodes: floors <= 4 ? ["ASC-001"] : ["ASC-002"],
      quantities: { [floors <= 4 ? "ASC-001" : "ASC-002"]: 1 },
    });
  }

  // ─── 15. CUISINE ─────────────────────────────────────────────────────────
  const cuisCodes = resolveCuisineCodes(input.kitchenType, input.kitchenCredenceType, input.finishLevel);
  activations.push({
    lotCode: "cuisine",
    articleCodes: cuisCodes.codes,
    quantities: cuisCodes.quantities,
  });

  // ─── 16. BUANDERIE ───────────────────────────────────────────────────────
  if (input.hasBuanderie) {
    activations.push({
      lotCode: "buanderie",
      articleCodes: ["BUAN-001"],
      quantities: { "BUAN-001": 1 },
    });
  }

  // ─── 17. CELLIER ─────────────────────────────────────────────────────────
  if (input.hasCellier) {
    const cellierCode = input.cellierStorageLevel === "equipped" ? "CELL-002" : "CELL-001";
    activations.push({
      lotCode: "cellier",
      articleCodes: [cellierCode],
      quantities: { [cellierCode]: 1 },
    });
  }

  // ─── 18. FONDATIONS + TERRASSEMENT (always for new_build) ────────────────
  activations.push({
    lotCode: "terrassement",
    articleCodes: ["TERR-001"],
    quantities: { "TERR-001": shon * 0.3 },
  });
  activations.push({
    lotCode: "fondations",
    articleCodes: ["FOND-001", "FOND-003"],
    quantities: { "FOND-001": shon * 0.15, "FOND-003": shon },
  });

  // ─── 19. VRD ─────────────────────────────────────────────────────────────
  activations.push({
    lotCode: "vrd",
    articleCodes: ["VRD-001"],
    quantities: { "VRD-001": 1 },
  });

  // ─── 20. Apply DB overrides from PriceCodeMapping ────────────────────────
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbMappings = await (prisma as any).priceCodeMapping.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });

    for (const mapping of dbMappings) {
      const inputVal = (input as unknown as Record<string, unknown>)[mapping.inputKey];
      if (String(inputVal) !== mapping.inputValue) continue;

      const existing = activations.find((a) => a.lotCode === mapping.targetLot);
      if (!existing) continue;

      const qty = resolveDbQuantity(mapping.quantityMode ?? "forfait", mapping.quantityValue ?? null, input);

      if (mapping.replaceMode === "replace") {
        if (mapping.defaultCodes.length === 0) continue;
        existing.articleCodes = mapping.defaultCodes;
        existing.quantities = {};
        for (const c of mapping.defaultCodes) {
          existing.quantities[c] = qty;
        }
      } else if (mapping.replaceMode === "add_only") {
        for (const c of mapping.defaultCodes) {
          if (!existing.articleCodes.includes(c)) {
            existing.articleCodes.push(c);
            existing.quantities[c] = qty;
          }
        }
      } else {
        // merge: add default codes, remove overridden ones
        for (const c of mapping.overrideCodes) {
          existing.articleCodes = existing.articleCodes.filter((x) => x !== c);
          delete existing.quantities[c];
        }
        for (const c of mapping.defaultCodes) {
          if (!existing.articleCodes.includes(c)) {
            existing.articleCodes.push(c);
            existing.quantities[c] = qty;
          }
        }
      }
    }
  } catch {
    // DB overrides not critical — continue with static rules
  }

  return activations.filter((a) => a.articleCodes.length > 0);
}

// ─── DB QUANTITY RESOLVER ─────────────────────────────────────────────────────

function resolveDbQuantity(mode: string, value: number | null | undefined, input: MappingInput): number {
  switch (mode) {
    case "surface_shon":        return input.surfaceShonM2;
    case "surface_shab":        return input.surfaceShabM2;
    case "window_area": {
      const area = input.windowAreaRatio * input.surfaceShabM2;
      return area > 0 ? area : 1;
    }
    case "interior_door_count": return input.interiorDoorCount;
    case "bathroom_count":      return input.bathroomCount;
    case "wc_count":            return input.wcCount;
    case "roof_window_count":   return input.roofWindowCount;
    case "count_fixed_1":       return 1;
    case "count_fixed_2":       return 2;
    case "manual_value":        return value ?? 1;
    case "forfait":
    default:                    return 1;
  }
}

// ─── RESOLVER HELPERS ────────────────────────────────────────────────────────

function resolveStructureCodes(structureType: string, shon: number): { codes: string[]; quantities: Record<string, number> } {
  const qty = shon;
  switch (structureType) {
    case "concrete":
      return { codes: ["GO-002", "GO-003"], quantities: { "GO-002": qty, "GO-003": qty } };
    case "masonry":
      return { codes: ["GO-001", "GO-003"], quantities: { "GO-001": qty, "GO-003": qty } };
    case "stone":
      return { codes: ["GO-005", "GO-003"], quantities: { "GO-005": qty, "GO-003": qty } };
    case "steel":
      return { codes: ["GO-006", "GO-003"], quantities: { "GO-006": qty, "GO-003": qty } };
    case "timber":
      return { codes: ["CHARP-003"], quantities: { "CHARP-003": qty } };
    case "mixed":
      return { codes: ["GO-002", "GO-006"], quantities: { "GO-002": qty * 0.6, "GO-006": qty * 0.4 } };
    default:
      return { codes: ["GO-002", "GO-003"], quantities: { "GO-002": qty, "GO-003": qty } };
  }
}

function resolveCharpenteCodes(structureType: string, roofType: string, shon: number): { codes: string[]; quantities: Record<string, number> } {
  const qty = shon;
  if (structureType === "timber") {
    return { codes: ["CHARP-003"], quantities: { "CHARP-003": qty } };
  }
  if (structureType === "steel") {
    return { codes: ["CHARP-004"], quantities: { "CHARP-004": qty } };
  }
  if (roofType === "flat") {
    return { codes: [], quantities: {} };
  }
  // pitched / mixed
  return { codes: ["CHARP-001"], quantities: { "CHARP-001": qty } };
}

function resolveCouvertureCodes(roofType: string, shon: number): { codes: string[]; quantities: Record<string, number> } {
  const qty = shon;
  switch (roofType) {
    case "flat":
      return { codes: ["COUV-003"], quantities: { "COUV-003": qty } };
    case "green_roof":
      return { codes: ["COUV-003", "COUV-004"], quantities: { "COUV-003": qty, "COUV-004": qty } };
    case "slate":
      return { codes: ["COUV-002"], quantities: { "COUV-002": qty * 1.1 } };
    case "pitched":
    default:
      return { codes: ["COUV-001"], quantities: { "COUV-001": qty * 1.1 } };
  }
}

function resolveWindowCodes(glazing: string, frame: string, opening: string, count: number, roofWindowCount: number) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  // Map glazing + frame to MEXT code
  const key = `${frame}_${glazing}`;
  const codeMap: Record<string, string> = {
    pvc_double: "MEXT-001",
    alu_double: "MEXT-002",
    alu_triple: "MEXT-007",
    pvc_triple: "MEXT-007",
    wood_double: "MEXT-006",
    wood_triple: "MEXT-007",
    wood_alu_double: "MEXT-002",
    wood_alu_triple: "MEXT-007",
  };
  const windowCode = codeMap[key] || "MEXT-001";
  codes.push(windowCode);
  quantities[windowCode] = count;

  // Add entry door
  codes.push("MEXT-004");
  quantities["MEXT-004"] = 1;

  // Add shutters for premium
  if (frame === "alu" || glazing === "triple") {
    codes.push("MEXT-005");
    quantities["MEXT-005"] = count;
  }

  // Roof windows
  if (roofWindowCount > 0) {
    codes.push("MEXT-008");
    quantities["MEXT-008"] = roofWindowCount;
  }

  return { codes, quantities };
}

function resolveInteriorDoorCodes(doorType: string, count: number) {
  if (count === 0) return { codes: [] as string[], quantities: {} as Record<string, number> };
  const codeMap: Record<string, string> = {
    standard: "MINT-001",
    premium: "MINT-002",
    sliding: "MINT-005",
    pocket: "MINT-005",
  };
  const code = codeMap[doorType] || "MINT-001";
  return { codes: [code], quantities: { [code]: count } };
}

function resolveStairCodes(stairType: string, stairFinish: string) {
  // ESC-* only (MINT-003/004 kept for backward compat but not used in new calc)
  const key = `${stairType}_${stairFinish}`;
  const codeMap: Record<string, string> = {
    straight_wood: "ESC-002",
    straight_metal: "ESC-003",
    straight_stone: "ESC-004",
    spiral_metal: "ESC-003",
    spiral_wood: "ESC-005",
    design_metal: "ESC-007",
    design_wood: "ESC-006",
    straight_concrete: "ESC-001",
  };
  const code = codeMap[key] || codeMap[`straight_${stairFinish}`] || "ESC-002";
  return { codes: [code], quantities: { [code]: 1 } };
}

function resolveRevCodes(finishLevel: string, shab: number, bathroomCount: number, wcCount: number) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  // Living areas
  if (finishLevel === "luxury") {
    codes.push("REV-005"); quantities["REV-005"] = shab * 0.3;
    codes.push("REV-003"); quantities["REV-003"] = shab * 0.4;
  } else if (finishLevel === "premium") {
    codes.push("REV-003"); quantities["REV-003"] = shab * 0.5;
    codes.push("REV-001"); quantities["REV-001"] = shab * 0.3;
  } else {
    codes.push("REV-002"); quantities["REV-002"] = shab * 0.6;
    codes.push("REV-001"); quantities["REV-001"] = shab * 0.2;
  }

  // Bathrooms (carrelage mural)
  const bathWallArea = 15; // avg m² per bathroom
  if (bathroomCount > 0) {
    codes.push("REV-004"); quantities["REV-004"] = bathroomCount * bathWallArea;
  }
  if (wcCount > 0) {
    codes.push("REV-001"); quantities["REV-001"] = (quantities["REV-001"] || 0) + wcCount * 4;
  }

  return { codes, quantities };
}

function resolvePlomberieCodes(bathroomCount: number, wcCount: number, bathroomType: string, showerType: string, shab: number) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  // Network
  codes.push("PLO-004"); quantities["PLO-004"] = shab;

  // Per bathroom
  if (bathroomCount > 0) {
    if (showerType === "italian" || showerType === "walk_in") {
      codes.push("PLO-005"); quantities["PLO-005"] = bathroomCount;
    } else {
      codes.push("PLO-001"); quantities["PLO-001"] = bathroomCount;
    }
    if (bathroomType === "bathtub" || bathroomType === "both") {
      codes.push("PLO-006"); quantities["PLO-006"] = bathroomCount;
    }
  }

  // WC
  if (wcCount > 0) {
    codes.push("PLO-002"); quantities["PLO-002"] = wcCount;
  }

  // Kitchen connection
  codes.push("PLO-003"); quantities["PLO-003"] = 1;

  return { codes, quantities };
}

function resolveElecCodes(electricLevel: string, shab: number, bathroomCount: number) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  const baseCode = electricLevel === "premium" || electricLevel === "domotic" ? "ELEC-002" : "ELEC-001";
  codes.push(baseCode); quantities[baseCode] = shab;
  codes.push("ELEC-003"); quantities["ELEC-003"] = 1;

  if (electricLevel === "domotic") {
    codes.push("ELEC-004"); quantities["ELEC-004"] = 1;
  }

  // VMR / VMC per bathroom (ventilation électrique)
  if (bathroomCount > 0) {
    codes.push("ELEC-008"); quantities["ELEC-008"] = bathroomCount;
  }

  return { codes, quantities };
}

function resolveHeatingCodes(heatingSystem: string, heatingDistribution: string, ventilationType: string, shab: number) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  // Equipment (heating source)
  switch (heatingSystem) {
    case "heat_pump": {
      const pacCode = shab <= 120 ? "PAC-001" : "PAC-002";
      codes.push(pacCode); quantities[pacCode] = 1;
      break;
    }
    case "electric":
      codes.push("CHAU-001"); quantities["CHAU-001"] = 1; // fallback electric boiler
      break;
    case "district":
      // district heating: only distribution
      break;
    case "gas":
    default:
      codes.push("CHAU-001"); quantities["CHAU-001"] = 1;
      break;
  }

  // Distribution (emission)
  if (heatingDistribution === "floor_heating") {
    codes.push("CHAU-006"); quantities["CHAU-006"] = shab;
  } else {
    // radiators
    codes.push("CHAU-005"); quantities["CHAU-005"] = shab;
  }

  // Ventilation
  if (ventilationType === "double_flow") {
    const vmcCode = shab <= 150 ? "VMC-001" : "VMC-002";
    codes.push(vmcCode); quantities[vmcCode] = 1;
  } else {
    codes.push("CHAU-004"); quantities["CHAU-004"] = 1;
  }

  return { codes, quantities };
}

function resolveCuisineCodes(kitchenType: string, credenceType: string, finishLevel: string) {
  const codes: string[] = [];
  const quantities: Record<string, number> = {};

  const cuisMap: Record<string, string> = {
    compact: "CUIS-001",
    standard: "CUIS-001",
    island: "CUIS-002",
    gourmet: "CUIS-003",
  };
  const mainCode = cuisMap[kitchenType] || "CUIS-001";
  codes.push(mainCode); quantities[mainCode] = 1;

  // Credence
  if (credenceType === "glass") {
    codes.push("CUIS-005"); quantities["CUIS-005"] = 1;
  } else if (credenceType === "stone") {
    codes.push("CUIS-006"); quantities["CUIS-006"] = 1;
  }

  return { codes, quantities };
}
