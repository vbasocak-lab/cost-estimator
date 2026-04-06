import { ProjectInput } from '../models/ProjectInput';
import { ActiveCode } from '../models/ActiveCode';

export function buildDefaultCodes(inputs: ProjectInput): ActiveCode[] {
    // Step 1: Read project inputs
    const projectInputs = inputs.getInputs();

    // Step 2: Create default active codes set
    const defaultActiveCodes: ActiveCode[] = [];

    // Step 3: Apply mapping rules (assuming a function exists for this)
    projectInputs.forEach(input => {
        const activeCode = new ActiveCode(input.code, input.description);
        defaultActiveCodes.push(activeCode);
    });

    // Step 4: Perform replace/add/disable operations (assuming a function exists for this)
    // This part would typically involve calling another function to apply operations

    // Step 5: Determine quantity source (assuming a function exists for this)
    // This part would typically involve calling another function to determine the source

    // Step 6: Return final active codes list
    return defaultActiveCodes;
}