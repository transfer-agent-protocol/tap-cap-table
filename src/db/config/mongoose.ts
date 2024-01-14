import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_OVERRIDE = process.env.DATABASE_OVERRIDE;

export const connectDB = async () => {
    const connectOptions = DATABASE_OVERRIDE ? {dbName: DATABASE_OVERRIDE} : {};
    try {
        await mongoose.connect(DATABASE_URL, connectOptions);
        console.log("✅ | Mongo connected succesfully");
        return mongoose.connection;
    } catch (error) {
        console.error("❌ | Error connecting to Mongo", error.message);
        // Exit process with failure
        process.exit(1);
    }
};
