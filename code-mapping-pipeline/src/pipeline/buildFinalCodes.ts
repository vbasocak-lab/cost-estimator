import { ActiveCode } from '../models/ActiveCode';
import { ProjectInput } from '../models/ProjectInput';
import { applyMappingRules } from './applyMappingRules';
import { applyOperations } from './applyOperations';
import { determineQuantitySource } from './determineQuantitySource';

export function buildFinalCodes(inputs: ProjectInput): ActiveCode[] {
    // Step 1: Read project inputs
    const activeCodes = buildDefaultCodes(inputs);

    // Step 2: Apply mapping rules
    const mappedCodes = applyMappingRules(activeCodes);

    // Step 3: Perform operations (replace/add/disable)
    const finalCodes = applyOperations(mappedCodes);

    // Step 4: Determine quantity source
    const quantitySource = determineQuantitySource(finalCodes);

    // Step 5: Return the final list of active codes
    return finalCodes;
}