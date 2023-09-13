import getContractInstance from "./getContractInstances.js";
import { convertAndCreateIssuanceStockOnchain } from "../db/controllers/transactions/issuanceController.js";
import { convertAndReflectStakeholderOnchain } from "../db/controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../db/controllers/stockClassController.js";
import { convertAndCreateTransferStockOnchain } from "../db/controllers/transactions/transferController.js";

const stakeholder1 = {
    id: "cce8f63e-8b20-4e50-ac68-ef8fd720cd8d",
    name: {
        legal_name: "Adam Momen",
        first_name: "Adam",
        last_name: "Momen",
    },
    issuer_assigned_id: "",
    stakeholder_type: "INDIVIDUAL",
    current_relationship: "EMPLOYEE",
    comments: [],
};

const stakeholder2 = {
    id: "aceb81e6-2d19-4ef2-ac53-05ff210d3509",
    name: {
        legal_name: "Victor Mimo",
        first_name: "Victor",
        last_name: "Mimo",
    },
    issuer_assigned_id: "",
    stakeholder_type: "INDIVIDUAL",
    current_relationship: "EMPLOYEE",
    comments: [],
};

const stockClass = {
    id: "c72dfac6-e013-41da-ac09-9ca018517a3a",
    name: "Series A Common",
    class_type: "COMMON",
    default_id_prefix: "CS-A",
    initial_shares_authorized: "1000000",
    // "board_approval_date": "", // IF NO DATE, then omit
    votes_per_share: "1",
    // "par_value": {}, // same as date
    price_per_share: {
        currency: "USD",
        amount: "1.23",
    },
    seniority: "1",
    // "conversion_rights": {}, // same as date
    // "liquidation_preference_multiple": "", // same as date
    // "participation_cap_multiple": "", // same as date
    comments: [],
};

const stockIssuance = {
    stakeholder_id: stakeholder1.id,
    stock_class_id: stockClass.id,
    quantity: "1000",
    share_price: {
        currency: "USD",
        amount: "1.20",
    },
    stock_legend_ids: [],
    // "stock_plan_id": "00000000-0000-0000-0000-000000000000",
    // "share_numbers_issued": [0,0],
    // "vesting_terms_id": "00000000-0000-0000-0000-000000000000",
    // "cost_basis": {
    //     "currency": "USD",
    //     "amount": "1.20"
    // },
    // "issuance_type": "",
    comments: [],
    custom_id: "",
    // "board_approval_date": "", // omit if null
    // "stockholder_approval_date": "", // same as above
    consideration_text: "",
    security_law_exemptions: [],
};

const stockTransfer = {
    quantity: "700",
    transferorId: stakeholder1.id,
    transfereeId: stakeholder2.id,
    stockClassId: stockClass.id,
    isBuyerVerified: true,
    sharePrice: "2.45",
};

const getActivePositions = async (contract) => {
    const activePositions = await contract.activePositions();
    console.log("activePositions", activePositions);
};

(async () => {
    const { contract, provider } = await getContractInstance("local");

    await convertAndReflectStakeholderOnchain(contract, stakeholder1);
    await convertAndReflectStakeholderOnchain(contract, stakeholder2);
    await convertAndReflectStockClassOnchain(contract, stockClass);

    await convertAndCreateIssuanceStockOnchain(contract, stockIssuance);
    await convertAndCreateTransferStockOnchain(contract, stockTransfer);
})();
