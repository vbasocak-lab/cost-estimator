import { DoorController } from '../controllers/doorController';
import { DoorService } from '../services/doorService';

describe('DoorController', () => {
    let doorController: DoorController;
    let doorService: DoorService;

    beforeEach(() => {
        doorService = new DoorService();
        doorController = new DoorController(doorService);
    });

    test('should get door details', async () => {
        const doorId = '1';
        const doorDetails = await doorController.getDoorDetails(doorId);
        expect(doorDetails).toBeDefined();
        // Add more specific assertions based on expected door details
    });

    test('should update door', async () => {
        const doorId = '1';
        const updateData = { doorWindowType: 'double', interiorDoorCount: 2, interiorDoorType: 'sliding' };
        const updatedDoor = await doorController.updateDoor(doorId, updateData);
        expect(updatedDoor).toEqual(expect.objectContaining(updateData));
    });
});

describe('DoorService', () => {
    let doorService: DoorService;

    beforeEach(() => {
        doorService = new DoorService();
    });

    test('should manage door types', () => {
        const doorTypes = doorService.getDoorTypes();
        expect(doorTypes).toContain('sliding');
        expect(doorTypes).toContain('hinged');
    });

    test('should calculate interior door count', () => {
        const count = doorService.calculateInteriorDoorCount();
        expect(count).toBeGreaterThan(0);
    });
});