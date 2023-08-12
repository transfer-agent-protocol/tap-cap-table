// Convert a price to a BigNumber
function toScaledBigNumber(price) {
    return ethers.BigNumber.from(Math.round(price * 1e10).toString());
}

// Convert a BigNumber back to a decimal price
function toDecimalPrice(scaledPriceBigNumber) {
    return parseFloat(scaledPriceBigNumber / 1e10).toString();
}

export { toScaledBigNumber, toDecimalPrice };
