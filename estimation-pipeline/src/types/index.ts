export type ProjectInput = {
    projectName: string;
    projectLocation: string;
    projectBudget: number;
    projectDeadline: Date;
};

export type BaseLot = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
};

export type Article = {
    id: string;
    name: string;
    category: string;
    baseLotId: string;
};

export type BreakdownItem = {
    description: string;
    amount: number;
};

export type Estimation = {
    totalCost: number;
    breakdown: BreakdownItem[];
    confidenceLevel: number;
};