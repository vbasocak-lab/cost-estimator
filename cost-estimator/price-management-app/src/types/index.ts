export type PriceItem = {
    id: string;
    name: string;
    price: number;
};

export type Rule = {
    id: string;
    description: string;
    conditions: string[];
};

export type Estimate = {
    id: string;
    totalCost: number;
    items: PriceItem[];
};

export type Lot = {
    id: string;
    quantity: number;
    price: number;
};

export type Summary = {
    totalItems: number;
    totalCost: number;
};