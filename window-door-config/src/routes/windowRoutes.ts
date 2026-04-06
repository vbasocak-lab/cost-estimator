import { Router } from 'express';
import { WindowController } from '../controllers/windowController';

const router = Router();
const windowController = new WindowController();

export function setWindowRoutes(app: Router) {
    app.use('/windows', router);
    router.get('/:id', windowController.getWindowDetails.bind(windowController));
    router.put('/:id', windowController.updateWindow.bind(windowController));
}