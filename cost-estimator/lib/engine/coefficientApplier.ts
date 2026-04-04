import { CoefficientSet, ProjectVersionInput } from "./types";

interface CoefficientData {
  regionalCoefficients: Array<{
    regionId: string;
    costLotId: string | null;
    coefficient: number;
    region: { code: string };
  }>;
  qualityCoefficients: Array<{
    finishLevelId: string;
    costLotId: string | null;
    coefficient: number;
    finishLevel: { code: string };
  }>;
  complexityCoefficients: Array<{
    complexityCode: string;
    costLotId: string | null;
    coefficient: number;
  }>;
  renovationScopes: Array<{
    code: string;
    coefficient: number;
  }>;
}

function findCoefficient(
  coeffs: Array<{ costLotId: string | null; coefficient: number }>,
  lotId: string,
  fallback: number
): number {
  // First try lot-specific
  const specific = coeffs.find((c) => c.costLotId === lotId);
  if (specific) return specific.coefficient;
  // Then global (null costLotId)
  const global = coeffs.find((c) => c.costLotId === null);
  if (global) return global.coefficient;
  return fallback;
}

export function buildCoefficientSet(
  lotId: string,
  input: ProjectVersionInput,
  data: CoefficientData
): CoefficientSet {
  // Regional coefficient
  const regionCoeffs = data.regionalCoefficients.filter(
    (rc) => rc.region.code === input.regionCode
  );
  const regional = findCoefficient(regionCoeffs, lotId, 1.0);

  // Quality coefficient
  const qualityCoeffs = data.qualityCoefficients.filter(
    (qc) => qc.finishLevel.code === input.finishLevelCode
  );
  const quality = findCoefficient(qualityCoeffs, lotId, 1.0);

  // Complexity coefficient
  const complexityCoeffs = data.complexityCoefficients.filter(
    (cc) => cc.complexityCode === input.facadeComplexity
  );
  const complexity = findCoefficient(complexityCoeffs, lotId, 1.0);

  // Renovation coefficient
  let renovation = 1.0;
  if (input.renovationScopeCode) {
    const scope = data.renovationScopes.find(
      (rs) => rs.code === input.renovationScopeCode
    );
    if (scope) renovation = scope.coefficient;
  }

  return {
    regional,
    quality,
    complexity,
    renovation,
    index: 1.0, // BT index adjustment applied separately
  };
}
