export const calculateTotalCost = (items: { price: number; quantity: number }[]): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateLotSize = (totalQuantity: number, lotSize: number): number => {
    return Math.ceil(totalQuantity / lotSize);
};

export const estimateCostWithMargin = (cost: number, marginPercentage: number): number => {
    return cost + (cost * marginPercentage) / 100;
};

export const summarizeData = (data: { totalCost: number; totalItems: number }): string => {
    return `Total Cost: ${data.totalCost}, Total Items: ${data.totalItems}`;
};