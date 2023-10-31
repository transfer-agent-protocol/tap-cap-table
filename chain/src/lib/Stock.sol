// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {StockAcceptance, ActivePositions, ActivePosition, Issuer, StockClass, SecIdsStockClass} from "./Structs.sol";
import "./TxHelper.sol";
import "./DeleteContext.sol";

library StockLib {
    function retractIssuanceByTA(
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        //TODO: require active position exists.

        StockRetraction memory retraction = TxHelper.createStockRetractionStruct(comments, securityId, reasonText);

        TxHelper.createTx(TxType.STOCK_RETRACTION, abi.encode(retraction), transactions);

        issuer.shares_issued = issuer.shares_issued - activePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - activePosition.quantity;

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function repurchaseByTA(
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory considerationText,
        uint256 quantity,
        uint256 price,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        require(activePosition.quantity >= quantity, "Insufficient shares");

        uint256 remainingQuantity = activePosition.quantity - quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            // issue balance
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                stakeholderId, remainingQuantity, activePosition.share_price, stockClassId
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(
            comments, securityId, considerationText, balance_security_id, quantity, price
        );

        TxHelper.createTx(TxType.STOCK_REPURCHASE, abi.encode(repurchase), transactions);

        issuer.shares_issued = issuer.shares_issued - quantity;
        stockClass.shares_issued = stockClass.shares_issued - quantity;

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function reissueByTA(
        bytes16 stakeholderId,
        bytes16 stockClassId,
        string[] memory comments,
        bytes16 securityId,
        bytes16[] memory resulting_security_ids,
        string memory reason_text,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        StockReissuance memory reissuance =
            TxHelper.createStockReissuanceStruct(comments, securityId, resulting_security_ids, reason_text);

        TxHelper.createTx(TxType.STOCK_REISSUANCE, abi.encode(reissuance), transactions);

        issuer.shares_issued = issuer.shares_issued - activePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - activePosition.quantity;

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function createIssuanceByTA(
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
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");
        StockIssuance memory issuance = TxHelper.createStockIssuanceStructByTA(
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
            customId,
            stakeholderId,
            boardApprovalDate,
            stockholderApprovalDate,
            considerationText,
            securityLawExemptions
        );

        _updateContext(issuance, positions, activeSecs, issuer, stockClass, transactions);
    }

    function _updateContext(
        StockIssuance memory issuance,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        Issuer storage issuer,
        StockClass storage stockClass,
        bytes32[] storage transactions
    ) internal {
        activeSecs.activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(
            issuance.security_id
        );

        positions.activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );

        issuer.shares_issued = issuer.shares_issued + issuance.quantity;
        stockClass.shares_issued = stockClass.shares_issued + issuance.quantity;
        TxHelper.createTx(TxType.STOCK_ISSUANCE, abi.encode(issuance), transactions);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    function acceptByTA(bytes16 securityId, string[] memory comments, bytes32[] storage transactions) external {
        StockAcceptance memory acceptance = TxHelper.createStockAcceptanceStruct(comments, securityId);
        TxHelper.createTx(TxType.STOCK_ACCEPTANCE, abi.encode(acceptance), transactions);
    }

    function cancelByTA(
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        uint256 quantity,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        // require(activePosition.quantity >= quantity, "Insufficient shares"); no check needed cause 0.8.0 check for underflow

        uint256 remainingQuantity = activePosition.quantity - quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            // issue balance

            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                stakeholderId, remainingQuantity, activePosition.share_price, stockClassId
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        StockCancellation memory cancellation =
            TxHelper.createStockCancellationStruct(quantity, comments, securityId, reasonText, balance_security_id);
        TxHelper.createTx(TxType.STOCK_CANCELLATION, abi.encode(cancellation), transactions);

        // no need to use SafeMath
        issuer.shares_issued = issuer.shares_issued - quantity;
        stockClass.shares_issued = stockClass.shares_issued - quantity;

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function transfer(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        // Checks related to transaction validity
        require(isBuyerVerified, "Buyer unverified");
        require(quantity > 0, "Invalid quantity");
        require(share_price > 0, "Invalid price");

        require(
            activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId].length > 0,
            "No active security ids found"
        );
        bytes16[] memory activeSecurityIDs =
            activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition memory activePosition =
                positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];
            sum += activePosition.quantity;

            if (sum >= quantity) {
                numSecurityIds += 1;
                break;
            } else {
                numSecurityIds += 1;
            }
        }

        require(quantity <= sum, "insufficient shares");

        uint256 remainingQuantity = quantity; // This will keep track of the remaining quantity to be transferred

        for (uint256 index = 0; index < numSecurityIds; index++) {
            ActivePosition memory activePosition =
                positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];

            uint256 transferQuantity; // This will be the quantity to transfer in this iteration

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            } else {
                transferQuantity = remainingQuantity;
            }

            _transferSingleStock(
                transferorStakeholderId,
                transfereeStakeholderId,
                stockClassId,
                transferQuantity,
                share_price,
                activeSecurityIDs[index],
                positions,
                activeSecs,
                transactions,
                issuer,
                stockClass
            );

            remainingQuantity -= transferQuantity; // Reduce the remaining quantity

            // If there's no more quantity left to transfer, break out of the loop
            if (remainingQuantity == 0) {
                break;
            }
        }
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function _transferSingleStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        uint256 quantity,
        uint256 sharePrice,
        bytes16 securityId,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes32[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition =
            positions.activePositions[transferorStakeholderId][transferorSecurityId];

        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        StockIssuance memory transfereeIssuance =
            TxHelper.createStockIssuanceStructForTransfer(transfereeStakeholderId, quantity, sharePrice, stockClassId);

        _updateContext(transfereeIssuance, positions, activeSecs, issuer, stockClass, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - quantity;

        bytes16 balance_security_id;

        if (balanceForTransferor > 0) {
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferorStakeholderId, balanceForTransferor, transferorActivePosition.share_price, stockClassId
            );

            _updateContext(transferorBalanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        StockTransfer memory transferData = TxHelper.createStockTransferStruct(
            quantity, transferorSecurityId, transfereeIssuance.security_id, balance_security_id
        );
        TxHelper.createTx(TxType.STOCK_TRANSFER, abi.encode(transferData), transactions);

        issuer.shares_issued = issuer.shares_issued - transferorActivePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - transferorActivePosition.quantity;

        DeleteContext.deleteActivePosition(transferorStakeholderId, transferorSecurityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(
            transferorStakeholderId, stockClassId, transferorSecurityId, activeSecs
        );
    }
}
