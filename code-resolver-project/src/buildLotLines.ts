export function buildLotLines(activeCodes, quantities) {
    if (activeCodes.length !== quantities.length) {
        throw new Error("The length of activeCodes and quantities must be the same.");
    }

    const lotLines = activeCodes.map((code, index) => {
        return {
            code: code,
            quantity: quantities[index]
        };
    });

    return lotLines;
}