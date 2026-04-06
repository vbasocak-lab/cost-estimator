export class ProjectInput {
    constructor(
        public projectName: string,
        public inputData: any,
        public mappingRules: Array<any>
    ) {}
}