export interface EstimationData {
    components: Array<{
        type: string;
        cost: number;
    }>;
    totalCost: number;
}

export interface ProjectData {
    name: string;
    description: string;
    estimations: EstimationData[];
}