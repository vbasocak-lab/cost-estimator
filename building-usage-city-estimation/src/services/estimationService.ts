export class EstimationService {
    private estimations: any[] = []; // Placeholder for estimation data

    constructor() {
        // Initialize with some default estimations if needed
    }

    public getEstimations(): any[] {
        return this.estimations;
    }

    public createEstimation(estimation: any): void {
        this.estimations.push(estimation);
    }

    public updateEstimation(id: number, updatedEstimation: any): void {
        const index = this.estimations.findIndex(est => est.id === id);
        if (index !== -1) {
            this.estimations[index] = { ...this.estimations[index], ...updatedEstimation };
        }
    }

    public getEstimationById(id: number): any | undefined {
        return this.estimations.find(est => est.id === id);
    }
}