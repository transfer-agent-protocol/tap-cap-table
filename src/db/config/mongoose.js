import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log("✅ Mongo connected succesfully");
    } catch (error) {
        console.error("❌ Error connecting to Mongo", error.message);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;
