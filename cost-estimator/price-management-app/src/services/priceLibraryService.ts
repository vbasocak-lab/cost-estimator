export class PriceLibraryService {
    private priceItems: PriceItem[] = [];

    addPriceItem(priceItem: PriceItem): void {
        this.priceItems.push(priceItem);
    }

    getPriceItems(): PriceItem[] {
        return this.priceItems;
    }

    deletePriceItem(id: string): void {
        this.priceItems = this.priceItems.filter(item => item.id !== id);
    }
}