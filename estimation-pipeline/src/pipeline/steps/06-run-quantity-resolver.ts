import { ActiveArticle } from '../../models/article';
import { QuantityResolver } from '../../resolvers/quantity-resolver';

export const runQuantityResolver = (activeArticles: ActiveArticle[]) => {
    const quantityResolver = new QuantityResolver();
    const resolvedQuantities = activeArticles.map(article => {
        return {
            articleId: article.id,
            resolvedQuantity: quantityResolver.resolve(article)
        };
    });
    return resolvedQuantities;
};