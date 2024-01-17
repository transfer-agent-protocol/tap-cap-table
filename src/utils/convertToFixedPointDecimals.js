import { toBigInt } from "ethers";

export const decimalScaleValue = 1e10;

// Convert a price to a BigInt
function toScaledBigNumber(price) {
    return toBigInt(Math.round(price * decimalScaleValue).toString());
}

// TODO: might not be refactored correctly from ethers v5 to v6
// Convert a BigInt back to a decimal price
function toDecimal(scaledPriceBigInt) {
    if (typeof scaledPriceBigInt === "bigint") {
        const numberString = scaledPriceBigInt.toString();
        return parseFloat(numberString / decimalScaleValue).toString();
    } else {
        return scaledPriceBigInt;
    }
}

// const convertTimeStampToUint40 = (date) => {
//     const datetime = new Date(date);
//     return toBigInt(Math.floor(datetime.getTime() / 1000)).toNumber();
// };

const convertTimeStampToUint40 = (date) => {
    const datetime = new Date(date);
    if (isNaN(datetime.getTime())) {
        throw new Error("Invalid date format provided.");
    }
    return toBigInt(Math.floor(datetime.getTime() / 1000));
};

export { toScaledBigNumber, toDecimal, convertTimeStampToUint40 };
