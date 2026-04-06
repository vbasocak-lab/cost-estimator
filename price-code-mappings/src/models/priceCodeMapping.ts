export class PriceCodeMapping {
    id: number;
    code: string;
    price: number;

    constructor(id: number, code: string, price: number) {
        this.id = id;
        this.code = code;
        this.price = price;
    }

    validate(): boolean {
        if (!this.code || this.price < 0) {
            return false;
        }
        return true;
    }
}