import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

export const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log("✅ | Mongo connected succesfully");
        return mongoose.connection;
    } catch (error) {
        console.error("❌ | Error connecting to Mongo", error.message);
        // Exit process with failure
        process.exit(1);
    }
};
