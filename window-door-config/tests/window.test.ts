import { Request, Response } from 'express';
import { WindowController } from '../src/controllers/windowController';
import { WindowService } from '../src/services/windowService';

describe('WindowController', () => {
    let windowController: WindowController;
    let windowService: WindowService;

    beforeEach(() => {
        windowService = new WindowService();
        windowController = new WindowController(windowService);
    });

    it('should get window details', async () => {
        const req = { params: { id: '1' } } as Request;
        const res = { json: jest.fn() } as unknown as Response;

        await windowController.getWindowDetails(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.any(Object)); // Replace with expected object
    });

    it('should update window', async () => {
        const req = { params: { id: '1' }, body: { /* window update data */ } } as Request;
        const res = { json: jest.fn() } as unknown as Response;

        await windowController.updateWindow(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.any(Object)); // Replace with expected object
    });
});

describe('WindowService', () => {
    let windowService: WindowService;

    beforeEach(() => {
        windowService = new WindowService();
    });

    it('should calculate window area ratio', () => {
        const area = windowService.calculateWindowAreaRatio(/* parameters */);
        expect(area).toBeGreaterThan(0); // Replace with expected condition
    });

    // Add more tests for other WindowService methods
});