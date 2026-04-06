import { Router } from 'express';
import LotsController from '../controllers/lotsController';

const router = Router();
const lotsController = new LotsController();

router.post('/lots', lotsController.createLot.bind(lotsController));
router.get('/lots', lotsController.getLots.bind(lotsController));
router.delete('/lots/:id', lotsController.deleteLot.bind(lotsController));

export default router;