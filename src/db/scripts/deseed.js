import { deseedDatabase } from "../../tests/deseed";

const runDeseed = async () => {
    try {
        await deseedDatabase();
    } catch (err) {
        console.log("❌ Error deseeding database:", err);
    }
};

runDeseed();
