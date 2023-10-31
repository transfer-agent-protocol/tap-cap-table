// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockIssuance, ActivePosition, ShareNumbersIssued, ActivePositions, SecIdsStockClass, Issuer, StockClass, StockIssuanceParams } from "../Structs.sol";
import "../DeterministicUUID.sol";
import "../../transactions/StockIssuanceTX.sol";

library StockIssuanceLib {
    using SafeMath for uint256;

    event StockIssuanceCreated(StockIssuance issuance);

    // TODO: split this up into multiple functions? e.g. call the optionals in a different function to fill out the same struct
    function createStockIssuanceByTA(
        uint256 nonce,
        StockIssuanceParams memory issuanceParams,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        require(issuanceParams.quantity > 0, "Invalid quantity");
        require(issuanceParams.sharePrice > 0, "Invalid price");
        nonce++;
        bytes16 id = DeterministicUUID.generateDeterministicUniqueID(issuanceParams.stakeholderId, nonce);
        nonce++;
        bytes16 secId = DeterministicUUID.generateDeterministicUniqueID(issuanceParams.stockClassId, nonce);
        //TODO: Move to TX helper
        StockIssuance memory issuance = StockIssuance(id, "TX_STOCK_ISSUANCE", secId, issuanceParams);
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
        activeSecs.activeSecurityIdsByStockClass[issuance.params.stakeholderId][issuance.params.stockClassId].push(issuance.security_id);

        positions.activePositions[issuance.params.stakeholderId][issuance.security_id] = ActivePosition(
            issuance.params.stockClassId,
            issuance.params.quantity,
            issuance.params.sharePrice,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );

        issuer.shares_issued = issuer.shares_issued.add(issuance.params.quantity);
        stockClass.shares_issued = stockClass.shares_issued.add(issuance.params.quantity);
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
