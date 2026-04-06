export class HeatingSystem {
    private systemType: string;
    private efficiencyRating: number;

    constructor(systemType: string, efficiencyRating: number) {
        this.systemType = systemType;
        this.efficiencyRating = efficiencyRating;
    }

    public getSystemType(): string {
        return this.systemType;
    }

    public setSystemType(systemType: string): void {
        this.systemType = systemType;
    }

    public getEfficiencyRating(): number {
        return this.efficiencyRating;
    }

    public setEfficiencyRating(efficiencyRating: number): void {
        this.efficiencyRating = efficiencyRating;
    }

    public displayInfo(): string {
        return `Heating System Type: ${this.systemType}, Efficiency Rating: ${this.efficiencyRating}`;
    }
}