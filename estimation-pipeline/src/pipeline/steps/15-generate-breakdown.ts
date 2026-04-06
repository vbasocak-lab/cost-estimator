import { Estimation } from '../models/estimation';
import { Breakdown } from '../models/breakdown';

export function generateBreakdown(estimation: Estimation): Breakdown {
    const breakdown: Breakdown = {
        total: estimation.total,
        details: []
    };

    // Assuming estimation has a property 'items' which contains the detailed items
    estimation.items.forEach(item => {
        breakdown.details.push({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
        });
    });

    return breakdown;
}