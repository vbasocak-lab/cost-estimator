export class HeatingDistribution {
    private distributionMethod: string;

    constructor(distributionMethod: string) {
        this.distributionMethod = distributionMethod;
    }

    public getDistributionMethod(): string {
        return this.distributionMethod;
    }

    public setDistributionMethod(method: string): void {
        this.distributionMethod = method;
    }

    public describe(): string {
        return `Heating distribution method: ${this.distributionMethod}`;
    }
}