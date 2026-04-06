import { Estimation } from '../../models/estimation';

export function applyOverhead(estimation: Estimation, overheadPercentage: number): Estimation {
    const overheadAmount = estimation.totalCost * (overheadPercentage / 100);
    estimation.totalCost += overheadAmount;
    estimation.overhead = overheadAmount;
    return estimation;
}