export class Estimation {
    components: any[];
    totalCost: number;

    constructor(components: any[]) {
        this.components = components;
        this.totalCost = this.calculateTotalCost();
    }

    calculateTotalCost(): number {
        return this.components.reduce((total, component) => {
            return total + component.calculateCost();
        }, 0);
    }
}