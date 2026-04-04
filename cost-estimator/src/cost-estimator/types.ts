export type RuleType = "condition" | "trigger" | "default";

export type LotCode =
  | "terrassement"
  | "fondations"
  | "structure"
  | "charpente"
  | "couverture"
  | "etancheite"
  | "menuiseries_exterieures"
  | "menuiseries_interieures"
  | "isolation"
  | "cloisons"
  | "revetements"
  | "peinture"
  | "plomberie"
  | "electricite"
  | "chauffage"
  | "ventilation"
  | "vrd"
  | "ascenseur"
  | "demolition"
  | "curage"
  | "reprises_structurelles"
  | "heat_pump"
  | "double_flux"
  | "escalier";

export type Unit = "m2" | "m3" | "u" | "ml" | "forfait";

export type ProjectType = "new_build" | "light_renovation" | "heavy_renovation";

export type FinishLevel = "standard" | "premium" | "luxury";

export type EnergyPackage = "none" | "standard" | "advanced";

export type ConfidenceLevel = "Bas" | "Moyen" | "Avance";

export interface ProjectInput {
  name: string;
  country: string;
  region: string;
  region_type?: "standard" | "major_city";
  project_type: ProjectType;
  finish_level: FinishLevel;
  energy_package: EnergyPackage;
  surface_m2: number;
  floors: number;
  has_basement: boolean;
  bathroom_count: number;
  kitchen: boolean;
  heated_area_m2: number;
  site_access?: "easy" | "difficult" | "very_difficult";
  quantities?: Partial<Record<LotCode, number>>;
}

export interface LotPrice {
  lot_code: LotCode;
  label: string;
  unit: Unit;
  base_price_ht: number;
}

export interface RuleCondition {
  region?: string;
  country?: string;
  project_type?: ProjectType;
  project_type_in?: ProjectType[];
  finish_level?: FinishLevel;
  energy_package?: EnergyPackage;
  has_basement?: boolean;
  floors_gte?: number;
  heated_area_m2_gt?: number;
  bathroom_count_gt?: number;
  kitchen?: boolean;
  surface_m2_lt?: number;
  surface_m2_gt?: number;
  site_access?: "easy" | "difficult" | "very_difficult";
  required_lots_completed_pct_gte?: number;
}

export interface RuleAction {
  set_region_coef?: number;
  apply_on?: "travaux_ht_only";
  require_lots?: LotCode[];
  require_one_of_lots?: LotCode[];
  activate_lots?: LotCode[];
  increase_contingency?: number;
  increase_coef?: Partial<Record<LotCode, number>>;
  increase_global_coef?: number;
  decrease_global_coef?: number;
  require_selection?: Array<"energy_package">;
  set_confidence?: ConfidenceLevel;
}

export interface Rule {
  rule_code: string;
  label: string;
  type: RuleType;
  priority: number;
  condition: RuleCondition;
  action: RuleAction;
}

export interface LotCalculation {
  lot_code: LotCode;
  label: string;
  unit: Unit;
  quantity: number;
  base_price_ht: number;
  adjusted_price_ht: number;
  total_ht: number;
  active: boolean;
}

export interface EstimateResult {
  project_name: string;
  confidence: ConfidenceLevel;
  required_lots: LotCode[];
  active_lots: LotCode[];
  missing_required_lots: LotCode[];
  region_coef: number;
  global_coef: number;
  contingency_rate: number;
  frais_generaux_rate: number;
  marge_rate: number;
  tva_rate: number;
  sous_total_travaux_ht: number;
  contingency_ht: number;
  frais_generaux_ht: number;
  marge_ht: number;
  total_ht: number;
  tva: number;
  total_ttc: number;
  breakdown: LotCalculation[];
  warnings: string[];
}
