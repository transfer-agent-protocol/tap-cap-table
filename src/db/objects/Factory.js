import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const FactorySchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "FACTORY" },
    implementation_address: String,
    factory_address: String,
}, { timestamps: true });

const Factory = mongoose.model("Factory", FactorySchema);

export default Factory;
