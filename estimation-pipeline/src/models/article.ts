export interface Article {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}