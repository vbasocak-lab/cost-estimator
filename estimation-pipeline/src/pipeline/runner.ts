import { collectInputs } from './steps/01-collect-inputs';
import { generateDefaults } from './steps/02-generate-defaults';
import { loadBaseLots } from './steps/03-load-base-lots';
import { applyMappingRules } from './steps/04-apply-mapping-rules';
import { buildActiveArticleList } from './steps/05-build-active-article-list';
import { runQuantityResolver } from './steps/06-run-quantity-resolver';
import { applyIndexedPrice } from './steps/07-apply-indexed-price';
import { applyRegionalCoef } from './steps/08-apply-regional-coef';
import { applyFinishCoef } from './steps/09-apply-finish-coef';
import { applyContingency } from './steps/10-apply-contingency';
import { applyOverhead } from './steps/11-apply-overhead';
import { applyProfit } from './steps/12-apply-profit';
import { applyVAT } from './steps/13-apply-vat';
import { evaluateConfidence } from './steps/14-evaluate-confidence';
import { generateBreakdown } from './steps/15-generate-breakdown';

export const runEstimationPipeline = async () => {
    const inputs = await collectInputs();
    const defaults = generateDefaults(inputs);
    const baseLots = await loadBaseLots();
    const mappedInputs = applyMappingRules(inputs, defaults, baseLots);
    const activeArticles = buildActiveArticleList(mappedInputs);
    const quantities = runQuantityResolver(activeArticles);
    const indexedPrices = applyIndexedPrice(quantities);
    const regionalPrices = applyRegionalCoef(indexedPrices);
    const finishPrices = applyFinishCoef(regionalPrices);
    const contingencyApplied = applyContingency(finishPrices);
    const overheadApplied = applyOverhead(contingencyApplied);
    const profitApplied = applyProfit(overheadApplied);
    const vatApplied = applyVAT(profitApplied);
    const confidence = evaluateConfidence(vatApplied);
    const breakdown = generateBreakdown(confidence);

    return breakdown;
};