import { toBigInt } from "ethers";

// Convert a price to a BigInt
function toScaledBigNumber(price) {
    return toBigInt(Math.round(price * 1e10).toString());
}

// Convert a BigInt back to a decimal price
function toDecimal(scaledPriceBigInt) {
    if (typeof scaledPriceBigInt === "bigint") {
        const numberString = scaledPriceBigInt.toString();
        return parseFloat(numberString / 1e10).toString();
    } else {
        return scaledPriceBigInt;
    }
}

// convert object to decimal
// WIP, still not working fully properly
function convertManyToDecimal(input) {
    if (Array.isArray(input)) {
        return input.map((item) => convertManyToDecimal(item));
    } else if (typeof input === "object" && input !== null) {
        if (input._isBigNumber) {
            return toDecimal(input);
        }
        let newObj = {};
        for (let key in input) {
            newObj[key] = convertObjectToDecimal(input[key]);
        }
        return newObj;
    } else {
        return input;
    }
}

export { convertManyToDecimal, toDecimal, toScaledBigNumber };
