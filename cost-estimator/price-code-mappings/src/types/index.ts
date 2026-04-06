export interface PriceCodeMapping {
    id: string;
    code: string;
    price: number;
}

export interface PriceMappingRequest {
    code: string;
    price: number;
}