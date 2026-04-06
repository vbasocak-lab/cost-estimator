export interface Calculation {
    total: number;
    discount: number;
    netAmount: number;
}

export interface CalculationResult {
    success: boolean;
    message: string;
    data?: Calculation;
}