export class Calculator {
    calculateTotal(prices: number[]): number {
        return prices.reduce((total, price) => total + price, 0);
    }

    calculateDiscount(price: number, discountRate: number): number {
        return price - (price * discountRate);
    }
}