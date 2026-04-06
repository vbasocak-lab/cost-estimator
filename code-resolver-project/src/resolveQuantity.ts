export function resolveQuantity(code, project) {
    // Assuming project has a structure that includes a list of items with their quantities
    const item = project.items.find(item => item.code === code);
    return item ? item.quantity : 0; // Return quantity if found, otherwise return 0
}