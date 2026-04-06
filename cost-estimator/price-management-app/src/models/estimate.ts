export interface Estimate {
    id: string;
    totalCost: number;
    items: Array<{
        priceItemId: string;
        quantity: number;
    }>;
}