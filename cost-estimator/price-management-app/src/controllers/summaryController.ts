export class SummaryController {
    private summaryService: SummaryService;

    constructor(summaryService: SummaryService) {
        this.summaryService = summaryService;
    }

    public generateSummary(data: any): Summary {
        return this.summaryService.createSummary(data);
    }

    public getSummary(id: string): Summary | null {
        return this.summaryService.getSummaryById(id);
    }
}