export const regionalCoefficients = {
    low: 0.9,
    medium: 1.0,
    high: 1.1,
    veryHigh: 1.2,
};

export function getRegionalCoefficient(region: string): number {
    switch (region) {
        case 'low':
            return regionalCoefficients.low;
        case 'medium':
            return regionalCoefficients.medium;
        case 'high':
            return regionalCoefficients.high;
        case 'veryHigh':
            return regionalCoefficients.veryHigh;
        default:
            throw new Error(`Unknown region: ${region}`);
    }
}