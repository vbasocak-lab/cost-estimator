import type { ConfidenceLevel, Rule } from "./types";

export function resolveConfidence(
  rules: Rule[],
  warnings: string[],
  completedPct: number,
  current: ConfidenceLevel = "Bas"
): ConfidenceLevel {
  if (rules.some((rule) => rule.action.set_confidence)) {
    return current;
  }

  if (completedPct >= 90 && warnings.length === 0) return "Avance";
  if (completedPct >= 65) return "Moyen";
  return "Bas";
}
