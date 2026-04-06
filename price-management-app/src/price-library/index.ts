export class PriceLibrary {
    private prices: Map<string, number>;

    constructor() {
        this.prices = new Map<string, number>();
    }

    addPrice(item: string, price: number): void {
        this.prices.set(item, price);
    }

    getPrice(item: string): number | undefined {
        return this.prices.get(item);
    }

    removePrice(item: string): void {
        this.prices.delete(item);
    }
}