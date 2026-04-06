import { pipeline } from '../src/pipeline/index';
import { collectInputs } from '../src/pipeline/steps/01-collect-inputs';
import { generateDefaults } from '../src/pipeline/steps/02-generate-defaults';
import { loadBaseLots } from '../src/pipeline/steps/03-load-base-lots';
import { applyMappingRules } from '../src/pipeline/steps/04-apply-mapping-rules';
import { buildActiveArticleList } from '../src/pipeline/steps/05-build-active-article-list';
import { runQuantityResolver } from '../src/pipeline/steps/06-run-quantity-resolver';
import { applyIndexedPrice } from '../src/pipeline/steps/07-apply-indexed-price';
import { applyRegionalCoef } from '../src/pipeline/steps/08-apply-regional-coef';
import { applyFinishCoef } from '../src/pipeline/steps/09-apply-finish-coef';
import { applyContingency } from '../src/pipeline/steps/10-apply-contingency';
import { applyOverhead } from '../src/pipeline/steps/11-apply-overhead';
import { applyProfit } from '../src/pipeline/steps/12-apply-profit';
import { applyVAT } from '../src/pipeline/steps/13-apply-vat';
import { evaluateConfidence } from '../src/pipeline/steps/14-evaluate-confidence';
import { generateBreakdown } from '../src/pipeline/steps/15-generate-breakdown';

describe('Estimation Pipeline', () => {
    it('should execute the pipeline successfully', async () => {
        const inputs = collectInputs();
        const defaults = generateDefaults(inputs);
        const baseLots = await loadBaseLots();
        const mappedInputs = applyMappingRules(inputs, baseLots);
        const activeArticles = buildActiveArticleList(mappedInputs);
        const quantities = runQuantityResolver(activeArticles);
        const indexedPrices = applyIndexedPrice(quantities);
        const regionalPrices = applyRegionalCoef(indexedPrices);
        const finishPrices = applyFinishCoef(regionalPrices);
        const withContingency = applyContingency(finishPrices);
        const withOverhead = applyOverhead(withContingency);
        const withProfit = applyProfit(withOverhead);
        const withVAT = applyVAT(withProfit);
        const confidence = evaluateConfidence(withVAT);
        const breakdown = generateBreakdown(confidence);

        expect(breakdown).toBeDefined();
        expect(confidence).toBeGreaterThan(0);
    });
});