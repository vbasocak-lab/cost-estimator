export function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export function formatSummary(totalItems: number, totalCost: number): string {
    return `Total Items: ${totalItems}, Total Cost: ${formatPrice(totalCost)}`;
}