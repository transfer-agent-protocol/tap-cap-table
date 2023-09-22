import { hexlify, getBytes } from "ethers";

function convertToUUID(uuidBytes16) {
    let uuidWithoutDashes = uuidBytes16.substring(2); // removes the '0x' prefix
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

function convertBytes16ToUUID(obj) {
    // single value
    if (typeof obj === "string" && obj.startsWith("0x")) {
        return convertToUUID(obj);
        // handing events
    } else if (Array.isArray(obj)) {
        return obj.map((item) => convertBytes16ToUUID(item));
    } else if (typeof obj === "object" && obj !== null) {
        let newObject = {};
        for (let key in obj) {
            newObject[key] = convertBytes16ToUUID(obj[key]);
        }
        return newObject;
    } else {
        return obj;
    }
}

function convertUUIDToBytes16(uuid) {
    console.log("inside of convert uuid to bytes 16");

    const previous = hexlify(getBytes("0x" + uuid.replace(/-/g, "")));
    console.log("previous", previous);
    console.log("type of prvious ", typeof previous);

    // const converted = hexlify(getBytes(uuid.replace(/-/g, "")));

    return previous;
}

export { convertBytes16ToUUID, convertUUIDToBytes16 };
