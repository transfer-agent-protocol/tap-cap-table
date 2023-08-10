import { utils } from "ethers";

function convertUUID(uuidBytes16) {
    let uuidWithoutDashes = utils.stripZeros(uuidBytes16).substr(2); // removes the '0x' prefix and leading zeros
    let uuid = [
        uuidWithoutDashes.slice(0, 8),
        "-",
        uuidWithoutDashes.slice(8, 12),
        "-",
        uuidWithoutDashes.slice(12, 16),
        "-",
        uuidWithoutDashes.slice(16, 20),
        "-",
        uuidWithoutDashes.slice(20),
    ].join("");
    return uuid;
}

export default convertUUID;
