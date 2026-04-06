export function determineQuantitySource(inputs: any): string {
    // Logic to determine the source for quantity data
    // This could involve checking the inputs for specific properties
    // and returning the appropriate source based on the project's requirements

    if (inputs.quantitySource) {
        return inputs.quantitySource;
    }

    // Default behavior if no specific source is provided
    return 'defaultSource';
}