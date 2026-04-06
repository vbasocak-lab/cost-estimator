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
  countryCode?: string;
  projectTypeCode: string;  // new_build | renovation | extension
  renovationScopeCode?: string; // light | complete | heavy
  energyStandardCode?: string;
  energyPackage?: string;   // RE2020_standard | RE2020_advanced
  heatingType: string;
  heatingDistribution?: string; // radiators | floor_heating
  ventilationType: string;
  hasElevator: boolean;
  contingencyRate: number;
  overheadRate: number;
  profitRate: number;
  vatRate: number;
  // New project-level inputs for rule evaluation
  siteAccess?: string;      // easy | difficult | very_difficult
  bathroomCount?: number;
  wcCount?: number;
  bedroomCount?: number;
  hasKitchen?: boolean;
  buildingAge?: string;     // pre_1948 | post_1948
  floorsAboveGround_raw?: number;
  // Dynamic configurator fields
  structureType?: string;   // concrete | masonry | stone | steel | timber | mixed
  roofType?: string;        // pitched | flat | slate | green_roof | mixed
  electricLevel?: string;   // standard | premium | domotic
  windowGlazingType?: string;
  windowFrameType?: string;
  windowOpeningType?: string;
  windowAreaRatio?: number;
  roofWindowCount?: number;
  interiorDoorCount?: number;
  interiorDoorType?: string;
  hasStair?: boolean;
  stairType?: string;
  stairFinish?: string;
  bathroomLevel?: string;
  bathroomType?: string;
  wcType?: string;
  showerType?: string;
  vanityType?: string;
  bathtubType?: string;
  kitchenType?: string;
  kitchenCredenceType?: string;
  hasBuanderie?: boolean;
  hasCellier?: boolean;
  cellierStorageLevel?: string;
  finishLevel?: string;
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
