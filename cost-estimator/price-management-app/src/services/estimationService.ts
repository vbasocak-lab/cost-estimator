export class EstimationService {
    private estimates: Estimate[] = [];

    createEstimate(totalCost: number, items: PriceItem[]): Estimate {
        const newEstimate: Estimate = {
            id: this.estimates.length + 1,
            totalCost,
            items
        };
        this.estimates.push(newEstimate);
        return newEstimate;
    }

    getEstimates(): Estimate[] {
        return this.estimates;
    }

    deleteEstimate(id: number): boolean {
        const index = this.estimates.findIndex(estimate => estimate.id === id);
        if (index !== -1) {
            this.estimates.splice(index, 1);
            return true;
        }
        return false;
    }
}