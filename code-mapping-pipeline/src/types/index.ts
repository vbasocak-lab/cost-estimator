export type ActiveCode = {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
};

export interface MappingRule {
    ruleId: string;
    description: string;
    apply: (activeCodes: ActiveCode[]) => ActiveCode[];
}

export interface ProjectInput {
    projectId: string;
    inputs: Record<string, any>;
}

export type QuantitySource = 'manual' | 'automatic';