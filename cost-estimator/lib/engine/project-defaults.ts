/**
 * project-defaults.ts
 * Generates default room/bathroom/WC/door counts based on SHAB surface.
 */

export interface ProjectProgram {
  bedroomCount: number;
  bathroomCount: number;
  wcCount: number;
  roomCount: number;
  interiorDoorCount: number;
  hasStair: boolean;
  kitchenType: string;
}

/**
 * Generate default program from habitable surface (SHAB).
 * Based on French residential norms and typical configurations.
 */
export function generateDefaultProgram(
  surfaceShabM2: number,
  aboveGroundFloors = 1
): ProjectProgram {
  let bedroomCount: number;
  let bathroomCount: number;
  let wcCount: number;
  let roomCount: number;
  let interiorDoorCount: number;
  let kitchenType: string;

  if (surfaceShabM2 < 30) {
    // Studio
    bedroomCount = 0;
    bathroomCount = 1;
    wcCount = 1;
    roomCount = 1;
    interiorDoorCount = 2;
    kitchenType = "compact";
  } else if (surfaceShabM2 < 50) {
    // T1/T2
    bedroomCount = 1;
    bathroomCount = 1;
    wcCount = 1;
    roomCount = 2;
    interiorDoorCount = 3;
    kitchenType = "compact";
  } else if (surfaceShabM2 < 80) {
    // T2/T3
    bedroomCount = 2;
    bathroomCount = 1;
    wcCount = 1;
    roomCount = 3;
    interiorDoorCount = 4;
    kitchenType = "standard";
  } else if (surfaceShabM2 < 110) {
    // T3/T4
    bedroomCount = 3;
    bathroomCount = 1;
    wcCount = 2;
    roomCount = 4;
    interiorDoorCount = 6;
    kitchenType = "standard";
  } else if (surfaceShabM2 < 150) {
    // T4/T5
    bedroomCount = 4;
    bathroomCount = 2;
    wcCount = 2;
    roomCount = 5;
    interiorDoorCount = 8;
    kitchenType = "standard";
  } else if (surfaceShabM2 < 200) {
    // Grande maison
    bedroomCount = 5;
    bathroomCount = 2;
    wcCount = 3;
    roomCount = 6;
    interiorDoorCount = 10;
    kitchenType = "island";
  } else {
    // Villa / très grande maison
    bedroomCount = 6;
    bathroomCount = 3;
    wcCount = 3;
    roomCount = 8;
    interiorDoorCount = 12;
    kitchenType = "island";
  }

  const hasStair = aboveGroundFloors > 1;

  return {
    bedroomCount,
    bathroomCount,
    wcCount,
    roomCount,
    interiorDoorCount,
    hasStair,
    kitchenType,
  };
}

/**
 * Estimate window count from surface and facade complexity.
 */
export function estimateWindowCount(
  surfaceShonM2: number,
  facadeComplexity: string
): number {
  const baseWindows = Math.round(surfaceShonM2 / 15);
  const complexityFactor =
    facadeComplexity === "complex" ? 1.3 :
    facadeComplexity === "simple" ? 0.8 : 1.0;
  return Math.max(3, Math.round(baseWindows * complexityFactor));
}
