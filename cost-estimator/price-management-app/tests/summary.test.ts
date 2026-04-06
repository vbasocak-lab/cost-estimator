import { SummaryController } from '../src/controllers/summaryController';
import { SummaryService } from '../src/services/summaryService';

describe('SummaryController', () => {
    let summaryController: SummaryController;
    let summaryService: SummaryService;

    beforeEach(() => {
        summaryService = new SummaryService();
        summaryController = new SummaryController(summaryService);
    });

    describe('generateSummary', () => {
        it('should generate a summary correctly', async () => {
            const mockData = { /* mock data for testing */ };
            const expectedSummary = { totalItems: 10, totalCost: 100 }; // expected result

            jest.spyOn(summaryService, 'generateSummary').mockResolvedValue(expectedSummary);

            const result = await summaryController.generateSummary(mockData);
            expect(result).toEqual(expectedSummary);
        });
    });

    describe('getSummary', () => {
        it('should return the summary', async () => {
            const expectedSummary = { totalItems: 10, totalCost: 100 };

            jest.spyOn(summaryService, 'getSummary').mockResolvedValue(expectedSummary);

            const result = await summaryController.getSummary();
            expect(result).toEqual(expectedSummary);
        });
    });
});