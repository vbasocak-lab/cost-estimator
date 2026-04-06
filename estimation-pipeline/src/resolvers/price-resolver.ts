import { QuantityResolver } from './quantity-resolver';
import { RegionalCoefficient } from '../coefficients/regional';
import { FinishCoefficient } from '../coefficients/finish';

export class PriceResolver {
    private quantityResolver: QuantityResolver;

    constructor() {
        this.quantityResolver = new QuantityResolver();
    }

    public resolvePrices(activeArticles: any[]): any[] {
        return activeArticles.map(article => {
            const quantity = this.quantityResolver.resolveQuantity(article);
            const indexedPrice = this.applyIndexedPrice(article.price, quantity);
            const regionalPrice = this.applyRegionalCoefficient(indexedPrice, article.region);
            const finishPrice = this.applyFinishCoefficient(regionalPrice, article.finishType);
            return {
                ...article,
                resolvedPrice: finishPrice
            };
        });
    }

    private applyIndexedPrice(price: number, quantity: number): number {
        // Implement logic to apply indexed pricing
        return price * quantity; // Placeholder logic
    }

    private applyRegionalCoefficient(price: number, region: string): number {
        const regionalCoef = RegionalCoefficient.getCoefficient(region);
        return price * regionalCoef; // Placeholder logic
    }

    private applyFinishCoefficient(price: number, finishType: string): number {
        const finishCoef = FinishCoefficient.getCoefficient(finishType);
        return price * finishCoef; // Placeholder logic
    }
}