import { readInputs } from './readInputs';
import { buildDefaultCodes } from './buildDefaultCodes';
import { applyMappingRules } from './applyMappingRules';
import { applyOperations } from './applyOperations';
import { determineQuantitySource } from './determineQuantitySource';
import { buildFinalCodes } from './buildFinalCodes';

export const runPipeline = async () => {
    const projectInputs = await readInputs();
    const defaultActiveCodes = buildDefaultCodes(projectInputs);
    const mappedCodes = applyMappingRules(defaultActiveCodes);
    const updatedCodes = applyOperations(mappedCodes);
    const quantitySource = determineQuantitySource(updatedCodes);
    const finalActiveCodes = buildFinalCodes(updatedCodes, quantitySource);

    return finalActiveCodes;
};