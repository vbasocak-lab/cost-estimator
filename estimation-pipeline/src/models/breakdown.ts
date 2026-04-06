export interface Breakdown {
    totalCost: number;
    itemBreakdown: ItemBreakdown[];
    contingencies: number;
    overhead: number;
    profit: number;
    vat: number;
    confidenceLevel: number;
}

export interface ItemBreakdown {
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    regionalCoefficient: number;
    finishCoefficient: number;
}