export class PriceLibraryController {
    private priceItems: PriceItem[] = [];

    public addPriceItem(priceItem: PriceItem): void {
        this.priceItems.push(priceItem);
    }

    public getPriceItems(): PriceItem[] {
        return this.priceItems;
    }

    public deletePriceItem(id: string): void {
        this.priceItems = this.priceItems.filter(item => item.id !== id);
    }
}

interface PriceItem {
    id: string;
    name: string;
    price: number;
}