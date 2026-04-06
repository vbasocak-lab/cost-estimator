import { buildDefaultCodes } from '../src/pipeline/buildDefaultCodes';
import { ProjectInput } from '../src/models/ProjectInput';
import { ActiveCode } from '../src/models/ActiveCode';

describe('buildDefaultCodes', () => {
    it('should create a default set of active codes from project inputs', () => {
        const inputs: ProjectInput = {
            // Mock project input data
            // Define the structure according to ProjectInput model
        };

        const expectedActiveCodes: ActiveCode[] = [
            // Define expected active codes based on the inputs
        ];

        const result = buildDefaultCodes(inputs);
        expect(result).toEqual(expectedActiveCodes);
    });

    it('should handle empty project inputs gracefully', () => {
        const inputs: ProjectInput = {
            // Mock empty project input data
        };

        const expectedActiveCodes: ActiveCode[] = [];

        const result = buildDefaultCodes(inputs);
        expect(result).toEqual(expectedActiveCodes);
    });

    // Additional test cases can be added here
});