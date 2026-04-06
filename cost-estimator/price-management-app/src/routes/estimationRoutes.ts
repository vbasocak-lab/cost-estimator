import { Router } from 'express';
import EstimationController from '../controllers/estimationController';

const router = Router();
const estimationController = new EstimationController();

router.post('/estimates', estimationController.createEstimate.bind(estimationController));
router.get('/estimates', estimationController.getEstimates.bind(estimationController));
router.delete('/estimates/:id', estimationController.deleteEstimate.bind(estimationController));

export default router;