import { ActiveCode } from '../models/ActiveCode';
import { MappingRule } from '../models/MappingRule';

export function applyOperations(activeCodes: ActiveCode[], mappingRules: MappingRule[]): ActiveCode[] {
    let updatedActiveCodes = [...activeCodes];

    mappingRules.forEach(rule => {
        switch (rule.operation) {
            case 'replace':
                updatedActiveCodes = updatedActiveCodes.map(code => 
                    code.id === rule.targetId ? { ...code, value: rule.newValue } : code
                );
                break;
            case 'add':
                updatedActiveCodes.push(new ActiveCode(rule.newCode));
                break;
            case 'disable':
                updatedActiveCodes = updatedActiveCodes.map(code => 
                    code.id === rule.targetId ? { ...code, active: false } : code
                );
                break;
            default:
                throw new Error(`Unknown operation: ${rule.operation}`);
        }
    });

    return updatedActiveCodes;
}