export interface Lot {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    regionalCoefficient?: number;
    finishCoefficient?: number;
    contingency?: number;
    overhead?: number;
    profit?: number;
    vat?: number;
}