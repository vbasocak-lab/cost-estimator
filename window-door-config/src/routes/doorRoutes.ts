import { Router } from 'express';
import DoorController from '../controllers/doorController';

const router = Router();
const doorController = new DoorController();

export const setDoorRoutes = (app) => {
    app.use('/api/doors', router);
    
    router.get('/:id', doorController.getDoorDetails.bind(doorController));
    router.put('/:id', doorController.updateDoor.bind(doorController));
};