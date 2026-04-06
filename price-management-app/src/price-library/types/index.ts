export interface Price {
    id: string;
    amount: number;
    currency: string;
}

export interface PriceEntry {
    price: Price;
    date: Date;
    description?: string;
}