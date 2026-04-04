import { ProjectVersionInput } from "./types";

/**
 * Returns the quantity for a given lot.
 * Unit reference: each lot's `defaultUnit` in the seed (m2 | m3 | u | ml | forfait).
 *
 * IMPORTANT: `plomberie`, `electricite`, and `chauffage_ventilation` have
 * defaultUnit = "forfait" in the seed. Their price items are priced per-unit
 * (e.g., bathroom installation €4,500/u).  We return a unit count (integer),
 * NOT the area — otherwise the engine produces catastrophic overestimates.
 */
export function resolveQuantity(
  lotCode: string,
  unit: string,
  input: ProjectVersionInput
): number {
  const area = input.grossAreaM2;
  const net = input.netAreaM2 > 0 ? input.netAreaM2 : area * 0.85;
  const floors = Math.max(input.floorsAboveGround, 1);
  const basements = input.floorsBelowGround ?? 0;

  switch (lotCode) {
    // ── Gros œuvre ───────────────────────────────────────────────────────────
    case "terrassement":
      // Volume: footprint × excavation depth (1 m base + 0.5 m per basement)
      return (area / floors) * (1.0 + basements * 0.5);

    case "fondations":
      // Concrete volume for strip footings
      return (area / floors) * 0.4;

    case "gros_oeuvre_structure":
      // All structural floor surfaces
      return area;

    case "charpente":
      // Roof projection with 35% pitch factor
      return (area / floors) * 1.35;

    case "couverture":
      return (area / floors) * 1.35;

    // ── Second œuvre ─────────────────────────────────────────────────────────
    case "menuiseries_ext": {
      // ~1 opening per 2.5 m of perimeter per floor
      const sideLength = Math.sqrt(area / floors);
      const perimeter = sideLength * 4;
      return Math.max(1, Math.round(perimeter * 0.4));
    }

    case "isolation":
      // Façade + roof surfaces
      return area + (area / floors) * 1.35;

    case "cloisons":
      // Partition walls ≈ 1.8 × net habitable area
      return net * 1.8;

    case "revetements":
      return net;

    case "peinture":
      // Walls + ceilings: ~3.5 × net area
      return net * 3.5;

    case "menuiseries_int": {
      // ~1 internal door per 15 m² net area, minimum 2
      return Math.max(2, Math.round(net / 15));
    }

    // ── Lots techniques — FORFAIT (unit count, NOT area) ─────────────────────
    case "plomberie": {
      // Number of bathrooms/WC units: rough estimate based on net area
      // ~1 bathroom per 40 m² net (min 1)
      return Math.max(1, Math.round(net / 40));
    }

    case "electricite": {
      // Electrical installation: 1 forfait per building
      // Price item unit = forfait → return 1
      return 1;
    }

    case "chauffage_ventilation": {
      // 1 heating/ventilation system per building
      return 1;
    }

    case "ascenseur":
      // 1 elevator per 1 000 m² or fraction thereof, minimum 1
      return Math.max(1, Math.ceil(area / 1000));

    // ── VRD ──────────────────────────────────────────────────────────────────
    case "vrd":
      return 1; // forfait

    default:
      if (unit === "forfait") return 1;
      if (unit === "m3") return area * 0.3;
      if (unit === "ml") return Math.sqrt(area) * 4; // perimeter estimate
      if (unit === "u") return Math.max(1, Math.round(area / 20));
      return area; // m2 fallback
  }
}
