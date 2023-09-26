// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockIssuance, ActivePosition, Issuer, Stakeholder, StockClass } from "./lib/Structs.sol";
import "./lib/TxHelper.sol";
import "./transactions/StockIssuanceTX.sol";
import "./transactions/StockTransferTX.sol";
import "./lib/Arrays.sol";

struct ActivePositions {
    mapping(bytes16 => mapping(bytes16 => ActivePosition)) activePositions;
}

struct SecIdsStockClass {
    mapping(bytes16 => mapping(bytes16 => bytes16[])) activeSecurityIdsByStockClass;
}

library StockIssuanceLib {
    event StockIssuanceCreated(StockIssuance issuance);

    function generateDeterministicUniqueID(bytes16 stakeholderId, uint256 nonce) public view returns (bytes16) {
        bytes16 deterministicValue = bytes16(keccak256(abi.encodePacked(stakeholderId, block.timestamp, block.prevrandao, nonce)));
        return deterministicValue;
    }

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
        address[] storage transactions
    ) external {
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        bytes16 id = generateDeterministicUniqueID(stakeholderId, nonce);
        bytes16 secId = generateDeterministicUniqueID(stockClassId, nonce);

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

        _updateContext(issuance, positions, activeSecs);
        _issueStock(issuance, transactions);
    }

    function _updateContext(StockIssuance memory issuance, ActivePositions storage positions, SecIdsStockClass storage activeSecs) internal {
        activeSecs.activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        positions.activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );
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

library StockTransferLib {
    event StockTransferCreated(StockTransfer transfer);

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price,
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) external {
        // Checks related to transaction validity
        require(isBuyerVerified, "Buyer unverified");
        require(quantity > 0, "Invalid quantity");
        require(share_price > 0, "Invalid price");

        require(activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId].length > 0, "No active security ids found");
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition memory activePosition = positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];
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
            ActivePosition memory activePosition = positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];

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
                nonce,
                positions,
                activeSecs,
                transactions
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
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = positions.activePositions[transferorStakeholderId][transferorSecurityId];

        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        nonce++; // verify this is correct.
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(
            nonce,
            transfereeStakeholderId,
            quantity,
            sharePrice,
            stockClassId
        );

        StockIssuanceLib._updateContext(transfereeIssuance, positions, activeSecs);
        StockIssuanceLib._issueStock(transfereeIssuance, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - quantity;

        bytes16 balance_security_id;

        if (balanceForTransferor > 0) {
            nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                nonce,
                transferorStakeholderId,
                balanceForTransferor,
                transferorActivePosition.share_price,
                stockClassId
            );

            StockIssuanceLib._updateContext(transferorBalanceIssuance, positions, activeSecs);
            StockIssuanceLib._issueStock(transferorBalanceIssuance, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        nonce++;
        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            nonce,
            quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer, transactions);

        _deleteActivePosition(transferorStakeholderId, transferorSecurityId, positions);
        _deleteActiveSecurityIdsByStockClass(transferorStakeholderId, stockClassId, transferorSecurityId, activeSecs);
    }

    function _deleteActivePosition(bytes16 _stakeholder_id, bytes16 _security_id, ActivePositions storage positions) internal {
        delete positions.activePositions[_stakeholder_id][_security_id];
    }

    // Active Security IDs by Stock Class { "stakeholder_id": { "stock_class_id-1": ["sec-id-1", "sec-id-2"] } }
    function _deleteActiveSecurityIdsByStockClass(
        bytes16 _stakeholder_id,
        bytes16 _stock_class_id,
        bytes16 _security_id,
        SecIdsStockClass storage activeSecs
    ) internal {
        bytes16[] storage securities = activeSecs.activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];

        uint256 index = find(securities, _security_id);
        if (index != type(uint256).max) {
            remove(securities, index);
        }
    }

    /**
     * @dev Searches for an element in a bytes16 array and returns its index.
     * Returns uint256(-1) if the element is not found.
     * @param array The array to search in.
     * @param element The element to search for.
     */
    function find(bytes16[] storage array, bytes16 element) internal view returns (uint256) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return type(uint256).max; // Return the maximum value of uint256 to indicate "not found"
    }

    /**
     * @dev Removes an element at a specific index in a bytes16 array.
     * Shifts all subsequent elements one position to the left and reduces the array length.
     * @param array The array to modify.
     * @param index The index of the element to remove.
     */
    function remove(bytes16[] storage array, uint256 index) internal {
        require(index < array.length, "Index out of bounds");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }

    function _transferStock(StockTransfer memory transfer, address[] storage transactions) internal {
        StockTransferTx transferTx = new StockTransferTx(transfer);
        transactions.push(address(transferTx));
        emit StockTransferCreated(transfer);
    }
}

contract CapTableLibs {
    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public transactions;

    // used to help generate deterministic UUIDs
    uint256 private nonce;

    // O(1) search
    // id -> index
    mapping(bytes16 => uint256) stakeholderIndex;
    mapping(bytes16 => uint256) stockClassIndex;

    // bit wonky but experimenting -> positions.activePositions
    ActivePositions positions;
    // bit wonky but experimenting -> activeSecs.activeSecurityIdsByStockClass
    SecIdsStockClass activeSecs;

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(bytes16 _id, string memory _name) {
        nonce = 0;
        issuer = Issuer(_id, _name);
        emit IssuerCreated(_id, _name);
    }

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) public {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    function createStockClass(bytes16 _id, string memory _class_type, uint256 _price_per_share, uint256 _initial_share_authorized) public {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    // // can extend this to check that it's not issuing more than stock_class initial shares issued
    function issueStockByTA(
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
        string[] memory securityLawExemptions
    ) external {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        nonce++;

        StockIssuanceLib.createStockIssuanceByTA(
            nonce,
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
            securityLawExemptions,
            positions,
            activeSecs,
            transactions
        );
    }

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price
    ) external {
        require(stakeholderIndex[transferorStakeholderId] > 0, "No transferor");
        require(stakeholderIndex[transfereeStakeholderId] > 0, "No transferee");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        nonce++;
        StockTransferLib.transferStock(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            isBuyerVerified,
            quantity,
            share_price,
            nonce,
            positions,
            activeSecs,
            transactions
        );
    }
}
