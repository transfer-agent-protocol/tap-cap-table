import { deseedDatabase } from "../../tests/integration/utils.ts";

const runDeseed = async () => {
    try {
        await deseedDatabase();
    } catch (err) {
        console.log("❌ Error deseeding database:", err);
    }
};

runDeseed();
