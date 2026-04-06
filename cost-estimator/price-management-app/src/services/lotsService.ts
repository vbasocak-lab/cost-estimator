export class LotsService {
    private lots: Lot[] = [];

    createLot(quantity: number, price: number): Lot {
        const newLot: Lot = {
            id: this.lots.length + 1,
            quantity,
            price
        };
        this.lots.push(newLot);
        return newLot;
    }

    getLots(): Lot[] {
        return this.lots;
    }

    deleteLot(id: number): boolean {
        const index = this.lots.findIndex(lot => lot.id === id);
        if (index !== -1) {
            this.lots.splice(index, 1);
            return true;
        }
        return false;
    }

    calculateTotalCost(): number {
        return this.lots.reduce((total, lot) => total + (lot.quantity * lot.price), 0);
    }
}