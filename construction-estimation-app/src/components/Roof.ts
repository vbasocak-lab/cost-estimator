export class Roof {
    type: string;
    slope: number;

    constructor(type: string, slope: number) {
        this.type = type;
        this.slope = slope;
    }

    calculateRoofCost(baseCost: number): number {
        // Example calculation based on slope and type
        const slopeFactor = this.slope > 30 ? 1.2 : 1.0; // Adjust cost based on slope
        const typeFactor = this.type === 'flat' ? 0.8 : 1.0; // Adjust cost based on type
        return baseCost * slopeFactor * typeFactor;
    }
}