// Types shared across the engine

export interface ProjectVersionInput {
  id: string;
  projectId: string;
  grossAreaM2: number;
  netAreaM2: number;
  floorsAboveGround: number;
  floorsBelowGround: number;
  facadeComplexity: string; // simple | standard | complex
  finishLevelCode: string;  // standard | premium | luxury
  regionCode: string;
  projectTypeCode: string;  // new_build | renovation | extension
  renovationScopeCode?: string; // light | complete | heavy
  energyStandardCode?: string;
  heatingType: string;
  ventilationType: string;
  hasElevator: boolean;
  contingencyRate: number;
  overheadRate: number;
  profitRate: number;
  vatRate: number;
  floorsAboveGround_raw?: number;
}

export interface LotPriceData {
  lotId: string;
  lotCode: string;
  lotLabel: string;
  unit: string;
  basePriceHt: number;
}

export interface CoefficientSet {
  regional: number;
  quality: number;
  complexity: number;
  renovation: number;
  index: number;
}

export interface CalculatedLot {
  lotId: string;
  lotCode: string;
  lotLabel: string;
  quantity: number;
  unit: string;
  unitPriceHt: number;
  lineTotalHt: number;
  coefficients: CoefficientSet;
  isActive: boolean;
}

export interface EngineResult {
  lots: CalculatedLot[];
  totalCostHt: number;
  totalCostTva: number;
  totalCostTtc: number;
  costPerM2Ht: number;
  costPerM2Ttc: number;
  contingencyAmount: number;
  overheadAmount: number;
  profitAmount: number;
  confidenceLevel: "indicatif" | "affine" | "avance";
  sensitivityLow: number;
  sensitivityHigh: number;
  warnings: string[];
}
