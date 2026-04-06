export interface Estimation {
    projectId: string;
    totalCost: number;
    breakdown: Breakdown[];
    confidenceLevel: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Breakdown {
    description: string;
    amount: number;
}