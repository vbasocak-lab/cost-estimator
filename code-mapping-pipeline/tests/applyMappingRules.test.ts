import { applyMappingRules } from '../src/pipeline/applyMappingRules';
import { ActiveCode } from '../src/models/ActiveCode';
import { MappingRule } from '../src/models/MappingRule';

describe('applyMappingRules', () => {
    let activeCodes: ActiveCode[];
    let mappingRules: MappingRule[];

    beforeEach(() => {
        activeCodes = [
            new ActiveCode('code1', 'description1'),
            new ActiveCode('code2', 'description2'),
        ];

        mappingRules = [
            new MappingRule('code1', 'newCode1', 'replace'),
            new MappingRule('code2', 'code2', 'disable'),
        ];
    });

    it('should apply replace mapping rule correctly', () => {
        const result = applyMappingRules(activeCodes, mappingRules);
        expect(result).toEqual([
            new ActiveCode('newCode1', 'description1'),
            new ActiveCode('code2', 'description2', false), // disabled
        ]);
    });

    it('should apply disable mapping rule correctly', () => {
        const result = applyMappingRules(activeCodes, mappingRules);
        expect(result[1].isActive).toBe(false);
    });

    it('should not modify active codes if no matching rules', () => {
        const noMatchRules = [new MappingRule('code3', 'newCode3', 'replace')];
        const result = applyMappingRules(activeCodes, noMatchRules);
        expect(result).toEqual(activeCodes);
    });
});