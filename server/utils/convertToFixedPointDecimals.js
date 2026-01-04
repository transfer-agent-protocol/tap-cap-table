import { toBigInt } from "ethers";

export const decimalScaleValue = 1e10;
export const usdcDecimalScaleValue = 1e6;

function getScale(currency) {
    if (currency === "USD") {
        return usdcDecimalScaleValue;
    }
    return decimalScaleValue;
}

// Convert a price to a BigInt
function toScaledBigNumber(price, currency) {
    return toBigInt(Math.round(price * getScale(currency)).toString());
}

// TODO: might not be refactored correctly from ethers v5 to v6
// Convert a BigInt back to a decimal price
function toDecimal(scaledPriceBigInt, currency) {
    if (typeof scaledPriceBigInt === "bigint") {
        const numberString = scaledPriceBigInt.toString();
        return parseFloat(numberString / getScale(currency)).toString();
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
