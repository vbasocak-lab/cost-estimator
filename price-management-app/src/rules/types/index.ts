export interface Rule {
    id: string;
    description: string;
    conditions: RuleCondition[];
}

export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
}