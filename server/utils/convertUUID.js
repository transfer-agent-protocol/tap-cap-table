import { bytes16ToUuid, uuidToBytes16 } from "@tap/units";

function convertToUUID(uuidBytes16) {
    return bytes16ToUuid(uuidBytes16);
}

function convertBytes16ToUUID(obj) {
    if (typeof obj === "string" && (obj.startsWith("0x") || obj.startsWith("0X"))) {
        const hex = obj.slice(2);
        if (hex.length === 32 && /^[0-9a-fA-F]+$/.test(hex)) {
            return convertToUUID(obj);
        }
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map((item) => convertBytes16ToUUID(item));
    } else if (typeof obj === "object" && obj !== null) {
        const newObject = {};
        for (const key in obj) {
            newObject[key] = convertBytes16ToUUID(obj[key]);
        }
        return newObject;
    }
    return obj;
}

function convertUUIDToBytes16(uuid) {
    return uuidToBytes16(uuid);
}

export { convertBytes16ToUUID, convertUUIDToBytes16 };
