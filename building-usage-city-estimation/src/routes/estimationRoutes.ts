import { Router } from 'express';
import { EstimationController } from '../controllers/estimationController';

const router = Router();
const estimationController = new EstimationController();

export function setEstimationRoutes(app) {
    app.use('/api/estimations', router);
    router.get('/', estimationController.getEstimation.bind(estimationController));
    router.post('/', estimationController.createEstimation.bind(estimationController));
    router.put('/:id', estimationController.updateEstimation.bind(estimationController));
}