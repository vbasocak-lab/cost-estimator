export class Heating {
    type: string;
    efficiency: number;

    constructor(type: string, efficiency: number) {
        this.type = type;
        this.efficiency = efficiency;
    }

    calculateHeatingCost(baseCost: number): number {
        return baseCost / this.efficiency;
    }
}