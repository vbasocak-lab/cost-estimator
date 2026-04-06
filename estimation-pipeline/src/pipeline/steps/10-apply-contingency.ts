import { Estimation } from '../../models/estimation';

export function applyContingency(estimation: Estimation, contingencyFactor: number): Estimation {
    const contingencyAmount = estimation.total * contingencyFactor;
    estimation.total += contingencyAmount;
    estimation.details.push({
        description: 'Contingency applied',
        amount: contingencyAmount,
    });
    return estimation;
}