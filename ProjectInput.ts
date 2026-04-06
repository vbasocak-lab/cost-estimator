export interface ProjectInput {
  // Project Identification
  projectId: string;
  projectName: string;
  projectDescription: string;

  // Client Information
  clientName: string;
  clientEmail: string;
  clientPhone: string;

  // Project Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Project Type & Category
  projectType: "residential" | "commercial" | "industrial" | "infrastructure";
  projectCategory: string;
  constructionMethod: string;

  // Project Timeline
  startDate: Date;
  estimatedEndDate: Date;
  projectDurationDays: number;

  // Project Size & Scope
  totalAreaSqFt: number;
  numberOfFloors: number;
  numberOfUnits?: number;
  parkingSpaces?: number;

  // Budget & Cost Estimation
  estimatedBudget: number;
  currency: string;
  contingencyPercentage: number;
  laborCostEstimate: number;
  materialCostEstimate: number;
  equipmentCostEstimate: number;
  overheadCostEstimate: number;

  // Materials
  primaryMaterial: string;
  materialsList: {
    materialName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];

  // Labor
  laborRequirements: {
    role: string;
    numberOfWorkers: number;
    hourlyRate: number;
    estimatedHours: number;
  }[];

  // Permits & Compliance
  permitsRequired: string[];
  zoningClassification: string;
  environmentalImpactAssessmentRequired: boolean;

  // Risk Assessment
  riskLevel: "low" | "medium" | "high" | "critical";
  identifiedRisks: string[];

  // Project Status
  status:
    | "draft"
    | "pending_review"
    | "approved"
    | "in_progress"
    | "on_hold"
    | "completed"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  attachments?: string[];
}