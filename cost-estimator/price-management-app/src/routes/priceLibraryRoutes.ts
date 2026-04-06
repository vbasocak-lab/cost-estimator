import { Router } from 'express';
import PriceLibraryController from '../controllers/priceLibraryController';

const router = Router();
const priceLibraryController = new PriceLibraryController();

router.post('/price-items', priceLibraryController.addPriceItem.bind(priceLibraryController));
router.get('/price-items', priceLibraryController.getPriceItems.bind(priceLibraryController));
router.delete('/price-items/:id', priceLibraryController.deletePriceItem.bind(priceLibraryController));

export default router;