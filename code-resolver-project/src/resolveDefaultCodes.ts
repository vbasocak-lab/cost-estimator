export function resolveDefaultCodes(project) {
    // Assuming project has a property 'defaultCodes' that needs to be resolved
    const resolvedCodes = [];

    if (project && project.defaultCodes) {
        project.defaultCodes.forEach(code => {
            // Logic to resolve each code, e.g., checking against a list of valid codes
            if (isValidCode(code)) {
                resolvedCodes.push(code);
            }
        });
    }

    return resolvedCodes;
}

// Helper function to validate codes
function isValidCode(code) {
    // Implement validation logic here
    return true; // Placeholder for actual validation logic
}