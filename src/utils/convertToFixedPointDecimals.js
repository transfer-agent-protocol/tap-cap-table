import { toBigInt } from "ethers";

// Convert a price to a BigInt
function toScaledBigNumber(price) {
    return toBigInt(Math.round(price * 1e10).toString());
}

// TODO: might not be refactored correctly from ethers v5 to v6
// Convert a BigInt back to a decimal price
function toDecimal(scaledPriceBigInt) {
    if (typeof scaledPriceBigInt === "bigint") {
        const numberString = scaledPriceBigInt.toString();
        return parseFloat(numberString / 1e10).toString();
    } else {
        return scaledPriceBigInt;
    }
}

const convertTimeStampToUint40 = (date) => {
    const datetime = new Date(date);
    return toBigInt(Math.floor(datetime.getTime() / 1000)).toNumber();
};

export { toScaledBigNumber, toDecimal, convertTimeStampToUint40 };
