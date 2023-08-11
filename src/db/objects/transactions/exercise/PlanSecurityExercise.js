import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityExerciseSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_EXERCISE" },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    consideration_text: String,
    resulting_security_ids: [String],
});

const PlanSecurityExercise = mongoose.model("PlanSecurityExercise", PlanSecurityExerciseSchema);

export default PlanSecurityExercise;
