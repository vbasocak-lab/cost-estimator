import { PriceLibraryController } from '../src/controllers/priceLibraryController';
import { PriceLibraryService } from '../src/services/priceLibraryService';

describe('PriceLibraryController', () => {
    let priceLibraryController: PriceLibraryController;
    let priceLibraryService: PriceLibraryService;

    beforeEach(() => {
        priceLibraryService = new PriceLibraryService();
        priceLibraryController = new PriceLibraryController(priceLibraryService);
    });

    it('should add a price item', async () => {
        const priceItem = { id: '1', name: 'Item 1', price: 100 };
        const result = await priceLibraryController.addPriceItem(priceItem);
        expect(result).toEqual(priceItem);
    });

    it('should get all price items', async () => {
        const result = await priceLibraryController.getPriceItems();
        expect(Array.isArray(result)).toBe(true);
    });

    it('should delete a price item', async () => {
        const priceItemId = '1';
        const result = await priceLibraryController.deletePriceItem(priceItemId);
        expect(result).toBe(true);
    });
});