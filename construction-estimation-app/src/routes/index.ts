import { Router } from 'express';
import { EstimationController } from '../controllers/EstimationController';

const router = Router();
const estimationController = new EstimationController();

export function setRoutes() {
    router.post('/estimations', estimationController.createEstimation.bind(estimationController));
    router.get('/estimations/:id', estimationController.getEstimation.bind(estimationController));
    
    return router;
}