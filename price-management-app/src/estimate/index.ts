export class Estimator {
    private estimates: Estimate[] = [];

    public calculateEstimate(price: number, quantity: number): EstimateResult {
        const total = price * quantity;
        const estimate: Estimate = { price, quantity, total };
        this.estimates.push(estimate);
        return { estimate, success: true };
    }

    public getEstimates(): Estimate[] {
        return this.estimates;
    }
}

export interface Estimate {
    price: number;
    quantity: number;
    total: number;
}

export interface EstimateResult {
    estimate: Estimate;
    success: boolean;
}