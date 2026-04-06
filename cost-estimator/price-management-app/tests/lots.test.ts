import { LotsService } from '../src/services/lotsService';
import { Lot } from '../src/models/lot';

describe('LotsController', () => {
    let lotsService: LotsService;

    beforeEach(() => {
        lotsService = new LotsService();
    });

    test('should create a new lot', () => {
        const newLot: Lot = { id: '1', quantity: 10, price: 100 };
        lotsService.createLot(newLot);
        const lots = lotsService.getLots();
        expect(lots).toContainEqual(newLot);
    });

    test('should get lots', () => {
        const lots = lotsService.getLots();
        expect(lots).toBeDefined();
    });

    test('should delete a lot', () => {
        const newLot: Lot = { id: '2', quantity: 5, price: 50 };
        lotsService.createLot(newLot);
        lotsService.deleteLot('2');
        const lots = lotsService.getLots();
        expect(lots).not.toContainEqual(newLot);
    });
});