import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const CurrentRelationshipType = [
    "ADVISOR",
    "BOARD_MEMBER",
    "CONSULTANT",
    "EMPLOYEE",
    "EX_ADVISOR",
    "EX_CONSULTANT",
    "EX_EMPLOYEE",
    "EXECUTIVE",
    "FOUNDER",
    "INVESTOR",
    "NON_US_EMPLOYEE",
    "OFFICER",
    "OTHER",
];

// This model is verified with optional and required fields, comments must remain to aid on-chain to off-chain translation.
const StakeholderSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "STAKEHOLDER" },
    name: {},
    stakeholder_type: String,
    issuer_assigned_id: String, // Meant to be an optional ID for internal to the company, like an employee
    object_type: { type: String, enum: CurrentRelationshipType },
    primary_contact: {},
    contact_info: {},
    comments: [String],
});

const Stakeholder = mongoose.model("Stakeholder", StakeholderSchema);

export default Stakeholder;
