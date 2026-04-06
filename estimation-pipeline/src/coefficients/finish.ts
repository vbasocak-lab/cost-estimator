export interface FinishCoefficient {
    type: string;
    value: number;
}

export const finishCoefficients: FinishCoefficient[] = [
    { type: 'Standard', value: 1.0 },
    { type: 'Premium', value: 1.2 },
    { type: 'Economy', value: 0.8 }
];

export function applyFinishCoefficient(basePrice: number, finishType: string): number {
    const coefficient = finishCoefficients.find(coef => coef.type === finishType);
    if (!coefficient) {
        throw new Error(`Finish type "${finishType}" not found.`);
    }
    return basePrice * coefficient.value;
}