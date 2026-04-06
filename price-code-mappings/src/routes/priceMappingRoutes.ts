import { Router } from 'express';
import PriceMappingController from '../controllers/priceMappingController';

const router = Router();
const priceMappingController = new PriceMappingController();

export function setRoutes(app) {
    app.use('/api/price-mappings', router);
    router.get('/', priceMappingController.getPriceMappings.bind(priceMappingController));
    router.post('/', priceMappingController.createPriceMapping.bind(priceMappingController));
}