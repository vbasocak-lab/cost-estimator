import { buildLotLines } from '../src/buildLotLines';

describe('buildLotLines', () => {
    it('should construct lot lines correctly with valid active codes and quantities', () => {
        const activeCodes = ['code1', 'code2', 'code3'];
        const quantities = [10, 20, 30];
        const expectedOutput = [
            { code: 'code1', quantity: 10 },
            { code: 'code2', quantity: 20 },
            { code: 'code3', quantity: 30 },
        ];

        const result = buildLotLines(activeCodes, quantities);
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array when no active codes are provided', () => {
        const activeCodes = [];
        const quantities = [];
        
        const result = buildLotLines(activeCodes, quantities);
        expect(result).toEqual([]);
    });

    it('should handle mismatched lengths of active codes and quantities', () => {
        const activeCodes = ['code1', 'code2'];
        const quantities = [10];

        const expectedOutput = [
            { code: 'code1', quantity: 10 },
        ];

        const result = buildLotLines(activeCodes, quantities);
        expect(result).toEqual(expectedOutput);
    });
});