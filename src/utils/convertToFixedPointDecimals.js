import ethers, { utils } from "ethers";

// Convert a price to a BigNumber
function toScaledBigNumber(price) {
    return ethers.BigNumber.from(Math.round(price * 1e10).toString());
}

// Convert a BigNumber back to a decimal price
function toDecimal(scaledPriceBigNumber) {
    if (ethers.BigNumber.isBigNumber(scaledPriceBigNumber)) {
        const numberString = scaledPriceBigNumber.toString();
        return parseFloat(numberString / 1e10).toString();
    } else {
        return scaledPriceBigNumber;
    }
}

function convertManyToDecimal(scaledPriceBigNumbers) {
    return scaledPriceBigNumbers.map(toDecimal);
}

export { toScaledBigNumber, toDecimal, convertManyToDecimal };
