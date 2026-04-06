export class LotManager {
    private lots: Lot[] = [];

    addLot(lot: Lot): void {
        this.lots.push(lot);
    }

    getLot(id: string): Lot | undefined {
        return this.lots.find(lot => lot.id === id);
    }

    removeLot(id: string): void {
        this.lots = this.lots.filter(lot => lot.id !== id);
    }
}

export interface Lot {
    id: string;
    name: string;
    quantity: number;
    details: LotDetails;
}

export interface LotDetails {
    description: string;
    location: string;
}