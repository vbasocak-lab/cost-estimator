import { readInputs } from './pipeline/readInputs';
import { buildDefaultCodes } from './pipeline/buildDefaultCodes';
import { applyMappingRules } from './pipeline/applyMappingRules';
import { applyOperations } from './pipeline/applyOperations';
import { determineQuantitySource } from './pipeline/determineQuantitySource';
import { buildFinalCodes } from './pipeline/buildFinalCodes';

async function main() {
    try {
        // Step 1: Read project inputs
        const projectInputs = await readInputs();

        // Step 2: Build default active codes
        const defaultActiveCodes = buildDefaultCodes(projectInputs);

        // Step 3: Apply all mapping rules
        const mappedCodes = applyMappingRules(defaultActiveCodes);

        // Step 4: Perform operations (replace/add/disable)
        const updatedCodes = applyOperations(mappedCodes);

        // Step 5: Determine quantity source
        const quantitySource = determineQuantitySource(updatedCodes);

        // Step 6: Build final active codes list
        const finalActiveCodes = buildFinalCodes(updatedCodes, quantitySource);

        console.log('Final Active Codes:', finalActiveCodes);
    } catch (error) {
        console.error('Error during the code mapping process:', error);
    }
}

main();