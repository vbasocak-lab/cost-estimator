export class SummaryService {
    private summaries: any[] = [];

    generateSummary(data: any[]): { totalItems: number; totalCost: number } {
        const totalItems = data.length;
        const totalCost = data.reduce((acc, item) => acc + item.price, 0);
        
        const summary = { totalItems, totalCost };
        this.summaries.push(summary);
        return summary;
    }

    getSummary(): any[] {
        return this.summaries;
    }
}