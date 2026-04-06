import { resolvePrice } from '../../src/resolvers/price-resolver';

describe('Price Resolver', () => {
    it('should resolve price correctly for given inputs', () => {
        const inputs = {
            quantity: 10,
            basePrice: 100,
            regionalCoefficient: 1.2,
            finishCoefficient: 1.1,
            overhead: 5,
            profit: 10,
            vat: 0.2
        };

        const expectedPrice = (inputs.basePrice * inputs.regionalCoefficient * inputs.finishCoefficient + inputs.overhead + inputs.profit) * (1 + inputs.vat);
        const resolvedPrice = resolvePrice(inputs);

        expect(resolvedPrice).toBeCloseTo(expectedPrice, 2);
    });

    it('should handle edge cases', () => {
        const inputs = {
            quantity: 0,
            basePrice: 100,
            regionalCoefficient: 1.0,
            finishCoefficient: 1.0,
            overhead: 0,
            profit: 0,
            vat: 0
        };

        const resolvedPrice = resolvePrice(inputs);
        expect(resolvedPrice).toBe(0);
    });

    // Additional test cases can be added here
});