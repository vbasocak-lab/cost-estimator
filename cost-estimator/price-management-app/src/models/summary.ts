export interface Summary {
    totalItems: number;
    totalCost: number;
    averageCostPerItem: number;
    itemDetails: Array<{
        itemName: string;
        itemCost: number;
    }>;
}