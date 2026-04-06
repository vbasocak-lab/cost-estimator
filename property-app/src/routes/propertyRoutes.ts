import { Router } from 'express';
import PropertyController from '../controllers/propertyController';

const router = Router();
const propertyController = new PropertyController();

export function setRoutes(app) {
    app.use('/api/properties', router);
    
    router.post('/', propertyController.createProperty.bind(propertyController));
    router.get('/:id', propertyController.getProperty.bind(propertyController));
    router.put('/:id', propertyController.updateProperty.bind(propertyController));
    router.delete('/:id', propertyController.deleteProperty.bind(propertyController));
}