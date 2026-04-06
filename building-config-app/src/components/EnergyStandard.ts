export class EnergyStandard {
    private standard: string;

    constructor(standard: string) {
        this.standard = standard;
    }

    public getStandard(): string {
        return this.standard;
    }

    public setStandard(standard: string): void {
        this.standard = standard;
    }

    public isEnergyEfficient(): boolean {
        // Implement logic to determine if the energy standard is efficient
        return this.standard === 'High Efficiency';
    }
}