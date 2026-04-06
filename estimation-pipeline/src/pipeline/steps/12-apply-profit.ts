import { Estimation } from '../../models/estimation';

export function applyProfit(estimation: Estimation, profitMargin: number): Estimation {
    const profit = estimation.totalCost * (profitMargin / 100);
    estimation.totalCost += profit;
    estimation.profit = profit;
    return estimation;
}