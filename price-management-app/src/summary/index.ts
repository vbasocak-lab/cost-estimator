export class SummaryGenerator {
    generateSummary(data: any[]): Summary {
        // Implementation for generating summary from pricing data
        return {
            totalItems: data.length,
            totalValue: data.reduce((acc, item) => acc + item.value, 0),
            // Additional summary calculations can be added here
        };
    }

    getSummary(data: any[]): SummaryDetail {
        const summary = this.generateSummary(data);
        return {
            summary,
            details: data.map(item => ({
                itemName: item.name,
                itemValue: item.value,
            })),
        };
    }
}

export interface Summary {
    totalItems: number;
    totalValue: number;
}

export interface SummaryDetail {
    summary: Summary;
    details: Array<{
        itemName: string;
        itemValue: number;
    }>;
}