import { ProjectInputs } from '../models/input';
import { DefaultValues } from '../models/estimation';

export function generateDefaults(inputs: ProjectInputs): DefaultValues {
    const defaults: DefaultValues = {
        quantity: 0,
        price: 0,
        regionalCoefficient: 1,
        finishCoefficient: 1,
        contingency: 0,
        overhead: 0,
        profit: 0,
        VAT: 0,
        confidence: 0,
    };

    // Generate default values based on inputs
    if (inputs.baseLot) {
        defaults.quantity = inputs.baseLot.defaultQuantity || defaults.quantity;
        defaults.price = inputs.baseLot.defaultPrice || defaults.price;
    }

    return defaults;
}