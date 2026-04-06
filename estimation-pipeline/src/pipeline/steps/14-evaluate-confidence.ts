import { Estimation } from '../../models/estimation';

export function evaluateConfidence(estimation: Estimation): number {
    // Placeholder for confidence evaluation logic
    // This function should analyze the estimation data and return a confidence level between 0 and 1
    let confidenceLevel = 0;

    // Example logic for evaluating confidence
    if (estimation.totalCost < estimation.budget) {
        confidenceLevel = 0.9; // High confidence if total cost is under budget
    } else if (estimation.totalCost < estimation.budget * 1.1) {
        confidenceLevel = 0.7; // Moderate confidence if total cost is within 10% of budget
    } else {
        confidenceLevel = 0.5; // Low confidence if total cost exceeds budget by more than 10%
    }

    return confidenceLevel;
}