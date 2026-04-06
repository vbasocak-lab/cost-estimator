export interface Estimate {
    id: string;
    projectId: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface EstimateResult {
    estimate: Estimate;
    success: boolean;
    message?: string;
}