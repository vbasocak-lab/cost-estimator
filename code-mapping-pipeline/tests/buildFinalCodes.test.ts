import { buildFinalCodes } from '../src/pipeline/buildFinalCodes';
import { ActiveCode } from '../src/models/ActiveCode';

describe('buildFinalCodes', () => {
    let activeCodes: ActiveCode[];

    beforeEach(() => {
        activeCodes = [
            new ActiveCode('code1', 'description1', true),
            new ActiveCode('code2', 'description2', false),
            new ActiveCode('code3', 'description3', true),
        ];
    });

    it('should return the final list of active codes', () => {
        const finalCodes = buildFinalCodes(activeCodes);
        expect(finalCodes).toEqual([
            { code: 'code1', description: 'description1', isActive: true },
            { code: 'code3', description: 'description3', isActive: true },
        ]);
    });

    it('should return an empty array if no active codes are provided', () => {
        const finalCodes = buildFinalCodes([]);
        expect(finalCodes).toEqual([]);
    });

    it('should handle cases where all codes are inactive', () => {
        activeCodes = [
            new ActiveCode('code1', 'description1', false),
            new ActiveCode('code2', 'description2', false),
        ];
        const finalCodes = buildFinalCodes(activeCodes);
        expect(finalCodes).toEqual([]);
    });
});