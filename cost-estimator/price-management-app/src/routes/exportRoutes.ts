import { Router } from 'express';
import ExportController from '../controllers/exportController';

const router = Router();
const exportController = new ExportController();

router.post('/export', exportController.exportToPDF.bind(exportController));

export default router;