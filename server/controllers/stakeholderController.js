import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { ethers } from "ethers";

/**
 * Stakeholder controller.
 * All functions convert UUIDs to bytes16 before calling CapTable contract methods.
 * Creation happens onchain first, then the DB record is saved by the route.
 * Getters are read-only views.
 */

/// @dev: controller handles conversion from OCF type to Onchain types and creates the stakeholder.
export const convertAndReflectStakeholderOnchain = async (contract, stakeholder) => {
    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholder.id);

    console.log("Stakeholder", stakeholder);

    console.log("Stakeholder id for seeding ", stakeholderIdBytes16);

    // Second: create stakeholder onchain
    const tx = await contract.createStakeholder(stakeholderIdBytes16, stakeholder.stakeholder_type, stakeholder.current_relationship);
    await tx.wait();

    console.log("✅ | Stakeholder created  onchain");
};

export const addWalletToStakeholder = async (contract, id, wallet) => {
    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    // Second: add wallet to stakeholder onchain
    const tx = await contract.addWalletToStakeholder(stakeholderIdBytes16, wallet);
    await tx.wait();

    console.log("✅ | Wallet added to stakeholder onchain");
};

export const removeWalletFromStakeholder = async (contract, id, wallet) => {
    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    // Second: remove wallet from stakeholder onchain
    const tx = await contract.removeWalletFromStakeholder(stakeholderIdBytes16, wallet);
    await tx.wait();

    console.log("✅ | Wallet removed from stakeholder onchain");
};

//TODO: to decide if we want to also return offchain data.
export const getStakeholderById = async (contract, id) => {
    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    // Second: get stakeholder onchain
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderIdBytes16);
    const stakeholderId = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("Stakeholder:", { stakeholderId, type, role });
    return { stakeholderId, type, role };
};

export const getStakeholderByWalletAddress = async (contract, walletAddress) => {
    // Second: get stakeholder onchain
    const stakeholderId = await contract.getStakeholderIdByWallet(walletAddress);
    console.log("Stakeholder:", { stakeholderId });
    return { stakeholderId };
};

export const getTotalNumberOfStakeholders = async (contract) => {
    const totalStakeholders = await contract.getTotalNumberOfStakeholders();
    console.log("＃ | Total number of stakeholders:", totalStakeholders.toString());
    return totalStakeholders.toString();
};
