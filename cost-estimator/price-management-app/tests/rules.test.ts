import { RulesService } from '../src/services/rulesService';
import { RulesController } from '../src/controllers/rulesController';

describe('RulesController', () => {
    let rulesController: RulesController;
    let rulesService: RulesService;

    beforeEach(() => {
        rulesService = new RulesService();
        rulesController = new RulesController(rulesService);
    });

    it('should add a rule', () => {
        const rule = { id: '1', description: 'Test Rule', conditions: [] };
        const result = rulesController.addRule(rule);
        expect(result).toEqual(rule);
    });

    it('should get all rules', () => {
        const rules = rulesController.getRules();
        expect(Array.isArray(rules)).toBe(true);
    });

    it('should delete a rule', () => {
        const ruleId = '1';
        rulesController.addRule({ id: ruleId, description: 'Test Rule', conditions: [] });
        const result = rulesController.deleteRule(ruleId);
        expect(result).toBe(true);
    });

    it('should return false when deleting a non-existent rule', () => {
        const result = rulesController.deleteRule('non-existent-id');
        expect(result).toBe(false);
    });
});