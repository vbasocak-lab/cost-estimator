import { ActiveCode } from '../models/ActiveCode';
import { MappingRule } from '../models/MappingRule';

export function applyMappingRules(activeCodes: ActiveCode[], mappingRules: MappingRule[]): ActiveCode[] {
    let updatedActiveCodes = [...activeCodes];

    mappingRules.forEach(rule => {
        updatedActiveCodes = updatedActiveCodes.map(code => {
            // Apply the mapping rule to each active code
            if (rule.condition(code)) {
                return rule.apply(code);
            }
            return code;
        });
    });

    return updatedActiveCodes;
}