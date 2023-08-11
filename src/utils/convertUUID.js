import { utils } from "ethers";

function convertToUUID(uuidBytes16) {
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

function convertBytes16ToUUID(object) {
    let newObject;
    Object.keys(object).forEach((field) => {
        if (object[field].includes("0x")) {
            newObject[field] = convertToUUID(object[field]);
        } else if (Array.isArray(object[field]) && object[field].length > 0) {
            if (object[field][0].includes("0x")) {
                newObject[field] = object[field].map(convertUUID);
            }
        } else {
            newObject[field] = object[field];
        }
    });
    return newObject;
}

function convertUUIDToBytes16(uuid) {
    return utils.hexlify(utils.arrayify("0x" + uuid.replace(/-/g, "")));
}

export { convertBytes16ToUUID, convertUUIDToBytes16 };