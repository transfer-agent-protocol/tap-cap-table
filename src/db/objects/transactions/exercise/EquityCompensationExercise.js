import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const EquityCompensationExerciseType = ["TX_PLAN_SECURITY_EXERCISE", "TX_EQUITY_COMPENSATION_EXERCISE"];

const EquityCompensationExerciseSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, enum: EquityCompensationExerciseType },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    consideration_text: String,
    resulting_security_ids: [String],
});

const EquityCompensationExercise = mongoose.model("EquityCompensationExercise", EquityCompensationExerciseSchema);

export default EquityCompensationExercise;
