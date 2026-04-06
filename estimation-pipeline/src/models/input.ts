export interface ProjectInput {
    projectName: string;
    projectLocation: string;
    projectBudget: number;
    startDate: Date;
    endDate: Date;
    stakeholders: string[];
    requirements: string[];
    baseLots: string[];
    mappingRules: string[];
}