import { toBigInt } from "ethers";
import { SCALE, scaleAmount, unscale } from "@tap/units";

/** Protocol scale is always 1e10. Do not use a USD/USDC 1e6 fork. */
export const decimalScaleValue = Number(SCALE);

function toScaledBigNumber(value) {
    return scaleAmount(value);
}

function toDecimal(scaledPriceBigInt) {
    if (typeof scaledPriceBigInt === "bigint") {
        return unscale(scaledPriceBigInt);
    }
    if (typeof scaledPriceBigInt === "number" || typeof scaledPriceBigInt === "string") {
        try {
            return unscale(scaledPriceBigInt);
        } catch {
            return scaledPriceBigInt;
        }
    }
    return scaledPriceBigInt;
}

const convertTimeStampToUint40 = (date) => {
    const datetime = new Date(date);
    if (isNaN(datetime.getTime())) {
        throw new Error("Invalid date format provided.");
    }
    return toBigInt(Math.floor(datetime.getTime() / 1000));
};

export { toScaledBigNumber, toDecimal, convertTimeStampToUint40 };
