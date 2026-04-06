export interface Summary {
    totalPrice: number;
    totalItems: number;
    details: SummaryDetail[];
}

export interface SummaryDetail {
    itemName: string;
    itemPrice: number;
    itemQuantity: number;
}