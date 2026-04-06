export class RulesService {
    private rules: Rule[] = [];

    addRule(rule: Rule): void {
        this.rules.push(rule);
    }

    getRules(): Rule[] {
        return this.rules;
    }

    deleteRule(ruleId: string): void {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }
}