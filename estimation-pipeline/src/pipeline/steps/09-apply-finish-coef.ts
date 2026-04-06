import { Estimation } from '../../models/estimation';
import { FinishCoefficient } from '../../coefficients/finish';

export function applyFinishCoefficient(estimation: Estimation): Estimation {
    const finishCoef = FinishCoefficient.getValue(estimation.finishType);
    
    estimation.finalPrice *= finishCoef;

    return estimation;
}