export interface Price {
    id: string;
    amount: number;
    currency: string;
}

export interface PriceEntry {
    price: Price;
    date: Date;
}

export interface Rule {
    id: string;
    description: string;
    condition: RuleCondition;
}

export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
}

export interface Estimate {
    id: string;
    total: number;
    breakdown: CalculationResult[];
}

export interface EstimateResult {
    estimate: Estimate;
    timestamp: Date;
}

export interface Calculation {
    id: string;
    type: string;
    value: number;
}

export interface CalculationResult {
    calculation: Calculation;
    result: number;
}

export interface Lot {
    id: string;
    name: string;
    quantity: number;
}

export interface LotDetails {
    lot: Lot;
    description: string;
}

export interface Summary {
    totalPrice: number;
    totalEstimates: number;
}

export interface SummaryDetail {
    estimateId: string;
    price: number;
}

export interface PDFOptions {
    title: string;
    author: string;
    margin: number;
}

export interface PDFDocument {
    content: string;
    options: PDFOptions;
}