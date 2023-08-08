// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { StockIssuance, StockTransfer } from "./Structs.sol";
import { IssuanceTX, TransferTX } from "./Enums.sol";

library TransactionHelper {

    /* It's likely we see two types of issuances, 
        - one created during transfers (createStockIssuanceStructForTransfer) where less info is needed.
        - one created one time by the TA for an major issuance event (createStockIssuanceStructByTA)  , like a new investor with the company or employee
    */
    function createStockIssuanceStructForTransfer(
        string memory transfereeId, 
        uint256 quantity, 
        int sharePrice, 
        string memory stockClassId
    ) 
        internal 
        pure 
        returns (StockIssuance memory issuance) 
    {
        return StockIssuance(
            "random-id", // id // TODO: just for testing, need a secure UUID
            IssuanceTX.TX_STOCK_ISSUANCE, 
            stockClassId,
            "", // stock plan id (optional) TODO: should we include in cap table?
            sharePrice, 
            quantity,
            "", // vesting terms id (optional) TODO: should we include in cap table?
            "", // cost basis (optional) TODO: should we include in cap table?
            new string[](0), // stock_legend_ids (optional) TODO: should we include in cap table?
            "", // issuance type (optional) TODO: should we include in cap table?
            new string[](0), // comments
            "security-id", // security_id //TODO: just for testing, need a secure UUID
            transfereeId, // stakeholder_id
            "", // board approval date (optional) TODO: should we include in cap table?
            "", // stockholder approval date (optional) TODO: should we include in cap table?
            "", // consideration text (optional) TODO: should we include in cap table?
            new string[](0) // security law exemptions (optional) TODO: should we include in cap table?
        );
    }

    function createStockIssuanceStructByTA(
        string memory stakeholderId, 
        uint256 quantity, 
        int sharePrice, 
        string memory stockClassId
    ) 
        internal 
        pure
        returns (StockIssuance memory issuance) 
    {
        // Temporary placeholders for UUIDs 
        // TODO: Replace with a more secure method for generating unique IDs
        string memory id = "random-id";
        string memory securityId = "random-security-id";

        return StockIssuance(
            id,                                         // ID
            IssuanceTX.TX_STOCK_ISSUANCE,                // Transaction type
            stockClassId,                               // Stock class ID
            "",                                         // Stock plan ID (optional)
            sharePrice,                                 // Share price
            quantity,                                   // Quantity
            "",                                         // Vesting terms ID (optional)
            "",                                         // Cost basis (optional)
            new string[](0),                            // Stock legend IDs (optional)
            "",                                         // Issuance type (optional)
            new string[](0),                            // Comments
            securityId,                                 // Security ID
            stakeholderId,                               // Stakeholder ID
            "",                                         // Board approval date (optional)
            "",                                         // Stockholder approval date (optional)
            "",                                         // Consideration text (optional)
            new string[](0)                             // Security law exemptions (optional)
        );
    }
    
    function createStockTransferStruct(
        uint256 quantity, 
        string memory security_id, 
        string memory resulting_security_id,
        string memory balance_security_id
    ) 
        internal 
        pure
        returns (StockTransfer memory transfer) 
    {
        string[] memory resultingSecurityIds = new string[](1);
        resultingSecurityIds[0] = resulting_security_id;
        
        return StockTransfer(
            "ramdom-id", // id // TODO: just for testing, need a secure UUID
            TransferTX.TX_STOCK_TRANSFER,
            quantity,
            new string[](0), // comments,
            security_id,
            "", // consideration text (optional) //TODO: should we include in cap table?
            balance_security_id,
            resultingSecurityIds
        );
    }

    

}
