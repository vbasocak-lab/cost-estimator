import { RegionalCoefficient } from '../../coefficients/regional';
import { Estimation } from '../../models/estimation';

export function applyRegionalCoef(estimation: Estimation): Estimation {
    const regionalCoef = RegionalCoefficient.getCoefficient(estimation.region);
    
    estimation.price *= regionalCoef;

    return estimation;
}