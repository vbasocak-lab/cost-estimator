import { ResolvedQuantity } from '../models/quantity';
import { IndexedPrice } from '../models/price';
import { applyIndexedPrice } from '../resolvers/price-resolver';

export function applyIndexedPriceStep(resolvedQuantities: ResolvedQuantity[]): IndexedPrice[] {
    return resolvedQuantities.map(quantity => {
        const indexedPrice = applyIndexedPrice(quantity);
        return {
            articleId: quantity.articleId,
            indexedPrice: indexedPrice,
            quantity: quantity.quantity,
        };
    });
}