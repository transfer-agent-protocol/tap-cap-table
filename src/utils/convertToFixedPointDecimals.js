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

export { toScaledBigNumber, toDecimal, convertManyToDecimal };
