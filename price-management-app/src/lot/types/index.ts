export interface Lot {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface LotDetails {
    lotId: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}