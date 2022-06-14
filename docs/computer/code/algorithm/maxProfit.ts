function maxProfit(prices: number[]) {
    let result = 0;
    for (let i = 0; i < prices.length - 1; i++) {
        const current = prices[i];
        const next = prices[i + 1];
        if (next >= current) {
            result += next - current;
        }
    }
    return result;
}
