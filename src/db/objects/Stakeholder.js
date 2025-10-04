import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StakeholderSchema = new mongoose.Schema(
    {
        _id: { type: String, default: () => uuid() },
        object_type: { type: String, default: "STAKEHOLDER" },
        name: {},
        stakeholder_type: String,
        issuer_assigned_id: String, // Meant to be an optional ID for internal to the company, like an employee
        current_relationship: { type: String },
        primary_contact: {},
        contact_info: {},
        comments: [String],
        issuer: {
            type: String,
            ref: "Issuer",
        },
        is_onchain_synced: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Stakeholder = mongoose.model("Stakeholder", StakeholderSchema);

export default Stakeholder;
