import { resolveQuantities } from '../../src/resolvers/quantity-resolver';

describe('Quantity Resolver', () => {
    it('should resolve quantities correctly for given active articles', () => {
        const activeArticles = [
            { id: 1, quantity: 10 },
            { id: 2, quantity: 5 },
        ];
        const expectedQuantities = [
            { id: 1, resolvedQuantity: 10 },
            { id: 2, resolvedQuantity: 5 },
        ];

        const result = resolveQuantities(activeArticles);
        expect(result).toEqual(expectedQuantities);
    });

    it('should handle empty active articles list', () => {
        const activeArticles = [];
        const expectedQuantities = [];

        const result = resolveQuantities(activeArticles);
        expect(result).toEqual(expectedQuantities);
    });

    it('should throw an error if active articles are not provided', () => {
        expect(() => resolveQuantities(undefined)).toThrow('Active articles are required');
    });
});