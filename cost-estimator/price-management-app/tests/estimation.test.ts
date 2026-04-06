import { EstimationController } from '../src/controllers/estimationController';
import { EstimationService } from '../src/services/estimationService';

describe('EstimationController', () => {
    let estimationController: EstimationController;
    let estimationService: EstimationService;

    beforeEach(() => {
        estimationService = new EstimationService();
        estimationController = new EstimationController(estimationService);
    });

    test('should create an estimate', async () => {
        const estimateData = { totalCost: 100, items: [] };
        const createEstimateSpy = jest.spyOn(estimationService, 'createEstimate').mockResolvedValue(estimateData);

        const result = await estimationController.createEstimate(estimateData);

        expect(createEstimateSpy).toHaveBeenCalledWith(estimateData);
        expect(result).toEqual(estimateData);
    });

    test('should get estimates', async () => {
        const estimates = [{ id: 1, totalCost: 100, items: [] }];
        const getEstimatesSpy = jest.spyOn(estimationService, 'getEstimates').mockResolvedValue(estimates);

        const result = await estimationController.getEstimates();

        expect(getEstimatesSpy).toHaveBeenCalled();
        expect(result).toEqual(estimates);
    });

    test('should delete an estimate', async () => {
        const estimateId = 1;
        const deleteEstimateSpy = jest.spyOn(estimationService, 'deleteEstimate').mockResolvedValue(true);

        const result = await estimationController.deleteEstimate(estimateId);

        expect(deleteEstimateSpy).toHaveBeenCalledWith(estimateId);
        expect(result).toBe(true);
    });
});