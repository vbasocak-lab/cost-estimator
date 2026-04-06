import { Router } from 'express';
import SummaryController from '../controllers/summaryController';

const router = Router();
const summaryController = new SummaryController();

router.get('/summary', summaryController.getSummary.bind(summaryController));
router.post('/summary/generate', summaryController.generateSummary.bind(summaryController));

export default router;