import { Router } from 'express';
import BuildingController from '../controllers/buildingController';

const router = Router();
const buildingController = new BuildingController();

export function setBuildingRoutes(app) {
    app.use('/api/buildings', router);
    router.get('/:id', buildingController.getBuilding.bind(buildingController));
    router.post('/', buildingController.createBuilding.bind(buildingController));
    router.put('/:id', buildingController.updateBuilding.bind(buildingController));
}