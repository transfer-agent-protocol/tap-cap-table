import Ajv from "ajv";
import addFormats from "ajv-formats";
import axios from "axios";

const ajv = new Ajv();
addFormats(ajv); // To support formats like date-time

async function fetchAndAddExternalSchema(schemaOrUrl) {
    let schema;

    // Check if the argument is a URL or a schema object
    if (typeof schemaOrUrl === "string") {
        // If it's a URL, fetch the schema
        const response = await axios.get(schemaOrUrl);
        schema = response.data;
        console.log("schema ", schema);
    } else {
        // If it's a schema object, use it directly
        schema = schemaOrUrl;
    }

    // Check if the schema is already added to avoid infinite loops
    if (ajv.getSchema(schema.$id)) return;

    // If the schema has its own $ref references, fetch and add those first
    if (schema.$ref) {
        await fetchAndAddExternalSchema(schema.$ref);
    }

    // If the schema has "allOf", "anyOf", "oneOf", or "not" keywords, handle those
    for (const keyword of ["allOf", "anyOf", "oneOf", "not"]) {
        if (schema[keyword]) {
            for (const subSchema of schema[keyword]) {
                if (subSchema.$ref) {
                    await fetchAndAddExternalSchema(subSchema.$ref);
                }
            }
        }
    }

    // Handle $ref references inside properties
    if (schema.properties) {
        for (const propName in schema.properties) {
            if (schema.properties[propName].$ref) {
                await fetchAndAddExternalSchema(schema.properties[propName].$ref);
            }
        }
    }

    // After all references have been fetched and added, add the current schema to AJV
    ajv.addSchema(schema, schema.$id);
}

async function validateInputAgainstSchema(input, schema) {
    // Fetch and add the external schema to AJV
    await fetchAndAddExternalSchema(schema);

    const validate = ajv.compile(schema);
    const valid = validate(input);
    if (!valid) {
        return {
            isValid: false,
            errors: validate.errors,
        };
    }
    return {
        isValid: true,
        errors: false,
    };
}

export default validateInputAgainstSchema;
