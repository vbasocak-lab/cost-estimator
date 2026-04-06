export class SurfaceM2 {
    area: number;

    constructor(area: number) {
        this.area = area;
    }

    calculateCost(): number {
        // Placeholder for cost estimation logic based on surface area
        const costPerSquareMeter = 100; // Example cost per square meter
        return this.area * costPerSquareMeter;
    }
}