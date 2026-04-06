export class Project {
    name: string;
    description: string;
    estimations: Estimation[];

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.estimations = [];
    }

    addEstimation(estimation: Estimation) {
        this.estimations.push(estimation);
    }

    getTotalCost(): number {
        return this.estimations.reduce((total, estimation) => total + estimation.totalCost, 0);
    }
}