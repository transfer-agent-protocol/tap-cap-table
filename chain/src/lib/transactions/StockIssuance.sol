// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockIssuance, ActivePosition, ShareNumbersIssued, ActivePositions, SecIdsStockClass, Issuer, StockClass } from "../Structs.sol";
import "../DeterministicUUID.sol";
import "../../transactions/StockIssuanceTX.sol";

library StockIssuanceLib {
    using SafeMath for uint256;

    event StockIssuanceCreated(StockIssuance issuance);

    function createStockIssuanceByTA(
        uint256 nonce,
        bytes16 stockClassId,
        bytes16 stockPlanId,
        ShareNumbersIssued memory shareNumbersIssued,
        uint256 sharePrice,
        uint256 quantity,
        bytes16 vestingTermsId,
        uint256 costBasis,
        bytes16[] memory stockLegendIds,
        string memory issuanceType,
        string[] memory comments,
        string memory customId,
        bytes16 stakeholderId,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        string memory considerationText,
        string[] memory securityLawExemptions,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        nonce++;
        bytes16 id = DeterministicUUID.generateDeterministicUniqueID(stakeholderId, nonce);
        nonce++;
        bytes16 secId = DeterministicUUID.generateDeterministicUniqueID(stockClassId, nonce);

        //TODO: Move to TX helper
        StockIssuance memory issuance = StockIssuance(
            id,
            "TX_STOCK_ISSUANCE",
            stockClassId,
            stockPlanId,
            shareNumbersIssued,
            sharePrice,
            quantity,
            vestingTermsId,
            costBasis,
            stockLegendIds,
            issuanceType,
            comments,
            secId,
            customId,
            stakeholderId,
            boardApprovalDate,
            stockholderApprovalDate,
            considerationText,
            securityLawExemptions
        );

        _updateContext(issuance, positions, activeSecs, issuer, stockClass);
        _issueStock(issuance, transactions);
    }

    function _updateContext(
        StockIssuance memory issuance,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        activeSecs.activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        positions.activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );

        issuer.shares_issued = issuer.shares_issued.add(issuance.quantity);
        stockClass.shares_issued = stockClass.shares_issued.add(issuance.quantity);
    }

    function _issueStock(StockIssuance memory issuance, address[] storage transactions) internal {
        StockIssuanceTx issuanceTx = new StockIssuanceTx(issuance);
        transactions.push(address(issuanceTx));
        emit StockIssuanceCreated(issuance);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }
}
