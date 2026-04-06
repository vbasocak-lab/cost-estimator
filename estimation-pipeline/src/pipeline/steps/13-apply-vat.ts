import { Estimation } from '../../models/estimation';

export function applyVAT(estimation: Estimation, vatRate: number): Estimation {
    const vatAmount = estimation.total * (vatRate / 100);
    estimation.total += vatAmount;
    estimation.vatAmount = vatAmount;
    return estimation;
}