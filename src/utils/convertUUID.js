import { concat } from "viem";

function convertToUUID(bytes16) {
    let uuidWithoutDashes = bytes16.slice(2);
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

export function convertBytes16ToUUID(object) {
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

export function convertUUIDToBytes16(uuid) {
    return concat(["0x", uuid.replace(/-/g, "")]);
}
