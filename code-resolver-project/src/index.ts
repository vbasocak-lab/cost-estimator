import { resolveDefaultCodes } from './resolveDefaultCodes';
import { applyMappings } from './applyMappings';
import { resolveQuantity } from './resolveQuantity';
import { buildLotLines } from './buildLotLines';

// Main entry point for the code resolver application
function main() {
    const project = {}; // Initialize your project object here
    const activeCodes = resolveDefaultCodes(project);
    const quantities = activeCodes.map(code => resolveQuantity(code, project));
    const lotLines = buildLotLines(activeCodes, quantities);

    console.log(lotLines); // Output the constructed lot lines
}

// Execute the main function
main();