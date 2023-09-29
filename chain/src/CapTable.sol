// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControlDefaultAdminRules } from "openzeppelin-contracts/contracts/access/AccessControlDefaultAdminRules.sol";
import { Issuer, Stakeholder, StockClass, ActivePositions, SecIdsStockClass } from "./lib/Structs.sol";
import "./lib/transactions/StockIssuance.sol";
import "./lib/transactions/StockTransfer.sol";
import "./lib/transactions/StockCancellation.sol";
import "./lib/transactions/StockRetraction.sol";
import "./lib/transactions/StockRepurchase.sol";
import "./lib/transactions/Adjustment.sol";

contract CapTable is AccessControlDefaultAdminRules {
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
    // wallet address => stakeholder_id
    mapping(address => bytes16) walletsPerStakeholder;

    // bit wonky but experimenting -> positions.activePositions
    ActivePositions positions;
    // bit wonky but experimenting -> activeSecs.activeSecurityIdsByStockClass
    SecIdsStockClass activeSecs;

    // RBAC
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(bytes16 _id, string memory _name, uint256 _initial_shares_authorized) AccessControlDefaultAdminRules(0 seconds, _msgSender()) {
        _grantRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);

        nonce = 0;
        issuer = Issuer(_id, _name, _initial_shares_authorized);
        emit IssuerCreated(_id, _name);
    }

    function seedMultipleActivePositionsAndSecurityIds(
        bytes16[] memory stakeholderIds,
        bytes16[] memory securityIds,
        bytes16[] memory stockClassIds,
        uint256[] memory quantities,
        uint256[] memory sharePrices,
        uint40[] memory timestamps
    ) external onlyAdmin {
        //TODO: check stakeholders and stock classes exist
        require(
            stakeholderIds.length == securityIds.length &&
                securityIds.length == stockClassIds.length &&
                stockClassIds.length == quantities.length &&
                quantities.length == sharePrices.length &&
                sharePrices.length == timestamps.length,
            "Input arrays must have the same length"
        );

        for (uint256 i = 0; i < stakeholderIds.length; i++) {
            // Set activePositions
            positions.activePositions[stakeholderIds[i]][securityIds[i]] = ActivePosition(
                stockClassIds[i],
                quantities[i],
                sharePrices[i],
                timestamps[i]
            );

            // Set activeSecurityIdsByStockClass
            activeSecs.activeSecurityIdsByStockClass[stakeholderIds[i]][stockClassIds[i]].push(securityIds[i]);
        }
    }

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) public onlyAdmin {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyAdmin {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] == bytes16(0), "Wallet already exists");

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyAdmin {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] != bytes16(0), "Wallet doesn't exist");

        delete walletsPerStakeholder[_wallet];
    }

    function getStakeholderIdByWallet(address _wallet) public view returns (bytes16 stakeholderId) {
        require(walletsPerStakeholder[_wallet] != bytes16(0), "No stakeholder found");
        return walletsPerStakeholder[_wallet];
    }

    /*
      "properties": {
    "object_type": {
      "const": "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT"
    },
    "id": {},
    "comments": {},
    "date": {},
    "issuer_id": {},
    "new_shares_authorized": {
      "description": "The new number of shares authorized for this issuer as of the event of this transaction",
      "$ref": "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/types/Numeric.schema.json"
    },
    "board_approval_date": {
      "description": "Date on which the board approved the change to the issuer",
      "$ref": "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/types/Date.schema.json"
    },
    "stockholder_approval_date": {
      "description": "Date on which the stockholders approved the change to the issuer",
      "$ref": "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/types/Date.schema.json"
    }
  },

    1. Create function here ✅
    2. Create library function ✅
    3. Create struct ✅ 
    4. Create tx contract ✅
    
     */

    function adjustIssuerAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external onlyAdmin {
        Adjustment.adjustIssuerAuthorizedShares(
            nonce,
            newSharesAuthorized,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            issuer,
            transactions
        );
    }

    function adjustStockClassAuthorizedShares(
        bytes16 stockClassId,
        uint256 newAuthorizedShares,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external onlyAdmin {
        // get stock class
        StockClass storage stockClass = stockClasses[stockClassIndex[stockClassId] - 1];
        require(stockClass.id == stockClassId, "Invalid stock class");

        Adjustment.adjustStockClassAuthorizedShares(
            nonce,
            newAuthorizedShares,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            stockClass,
            transactions
        );
    }

    function createStockClass(bytes16 _id, string memory _class_type, uint256 _price_per_share, uint256 _initial_share_authorized) public {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    function getStakeholderById(bytes16 _id) public view returns (bytes16, string memory, string memory) {
        if (stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    function getStockClassById(bytes16 _id) public view returns (bytes16, string memory, uint256, uint256) {
        if (stockClassIndex[_id] > 0) {
            StockClass memory stockClass = stockClasses[stockClassIndex[_id] - 1];
            return (stockClass.id, stockClass.class_type, stockClass.price_per_share, stockClass.shares_authorized);
        } else {
            return ("", "", 0, 0);
        }
    }

    function getTotalNumberOfStakeholders() public view returns (uint256) {
        return stakeholders.length;
    }

    function getTotalNumberOfStockClasses() public view returns (uint256) {
        return stockClasses.length;
    }

    // can extend this to check that it's not issuing more than stock_class initial shares issued
    // TODO: small syntax but change this to issueStock=
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
    ) external onlyAdmin {
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

    function repurchaseStock(
        bytes16 stakeholderId, // not OCF, but required to fetch activePositions
        bytes16 stockClassId, //  not OCF, but required to fetch activePositions
        bytes16 securityId,
        string[] memory comments,
        string memory considerationText,
        uint256 quantity,
        uint256 price
    ) external onlyAdmin {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        StockRepurchaseLib.repurchaseStockByTA(
            nonce,
            stakeholderId,
            stockClassId,
            securityId,
            comments,
            considerationText,
            quantity,
            price,
            positions,
            activeSecs,
            transactions
        );
    }

    function retractStockIssuance(
        bytes16 stakeholderId, // not OCF, but required to fetch activePositions
        bytes16 stockClassId, //  not OCF, but required to fetch activePositions
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText
    ) external onlyAdmin {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        StockRetractionLib.retractStockIssuanceByTA(
            nonce,
            stakeholderId,
            stockClassId,
            securityId,
            comments,
            reasonText,
            positions,
            activeSecs,
            transactions
        );
    }

    /**
    "properties": {
    "object_type": {
      "const": "TX_STOCK_REISSUANCE"
    },
    "id": {},
    "comments": {},
    "security_id": {},
    "date": {},
    "resulting_security_ids": {},
    "split_transaction_id": {},
    "reason_text": {}
  },
    
     */

    // function reissueStock(
    //      bytes16 stakeholderId, // not OCF, but required to fetch activePositions
    //     bytes16 stockClassId, //  not OCF, but required to fetch activePositions
    //     bytes16 securityId,
    //     string[] memory comments,
    //     string memory reasonText,
    // )

    // Missed date here. Make sure it's recorded where it needs to be (in the struct)
    // TODO: dates seem to be missing in a handful of places, go back and recheck
    function cancelStock(
        bytes16 stakeholderId, // not OCF, but required to fetch activePositions
        bytes16 stockClassId, //  not OCF, but required to fetch activePositions
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        uint256 quantity
    ) external onlyAdmin {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        // need a require for activePositions
        StockCancellationLib.cancelStockByTA(
            nonce,
            stakeholderId,
            stockClassId,
            securityId,
            comments,
            reasonText,
            quantity,
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
    ) external onlyOperator {
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

    /* Role Based Access Control */

    modifier onlyOperator() {
        /// @notice Admins are also considered Operators
        require(hasRole(OPERATOR_ROLE, _msgSender()) || _isAdmin(), "Does not have operator role");
        _;
    }

    modifier onlyAdmin() {
        require(_isAdmin(), "Does not have admin role");
        _;
    }

    function _isAdmin() internal view returns (bool) {
        return hasRole(ADMIN_ROLE, _msgSender());
    }

    //  External API for updating roles of addresses

    function addAdmin(address addr) external onlyAdmin {
        _grantRole(ADMIN_ROLE, addr);
    }

    function removeAdmin(address addr) external onlyAdmin {
        _revokeRole(ADMIN_ROLE, addr);
    }

    function addOperator(address addr) external onlyAdmin {
        _grantRole(OPERATOR_ROLE, addr);
    }

    function removeOperator(address addr) external onlyAdmin {
        _revokeRole(OPERATOR_ROLE, addr);
    }
}
