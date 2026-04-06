import { Router } from 'express';
import RulesController from '../controllers/rulesController';

const router = Router();
const rulesController = new RulesController();

router.post('/rules', rulesController.addRule.bind(rulesController));
router.get('/rules', rulesController.getRules.bind(rulesController));
router.delete('/rules/:id', rulesController.deleteRule.bind(rulesController));

export default router;