// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { AccessControlDefaultAdminRules } from "openzeppelin-contracts/contracts/access/AccessControlDefaultAdminRules.sol";
import { ICapTable } from "./ICapTable.sol";
import { StockTransferTransferParams, Issuer, Stakeholder, StockClass, ActivePositions, SecIdsStockClass, StockLegendTemplate, StockParams, StockParamsQuantity } from "./lib/Structs.sol";
import "./lib/transactions/StockIssuance.sol";
import "./lib/transactions/StockTransfer.sol";
import "./lib/transactions/StockCancellation.sol";
import "./lib/transactions/StockRetraction.sol";
import "./lib/transactions/StockRepurchase.sol";
import "./lib/transactions/Adjustment.sol";
import "./lib/transactions/StockAcceptance.sol";
import "./lib/transactions/StockReissuance.sol";

contract CapTable is ICapTable, AccessControlDefaultAdminRules {
    using SafeMath for uint256;

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    StockLegendTemplate[] public stockLegendTemplates;

    /// @inheritdoc ICapTable
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public override transactions;

    // used to help generate deterministic UUIDs
    uint256 private nonce;

    /// @inheritdoc ICapTable
    // O(1) search
    // id -> index
    mapping(bytes16 => uint256) public override stakeholderIndex;
    /// @inheritdoc ICapTable
    mapping(bytes16 => uint256) public override stockClassIndex;
    /// @inheritdoc ICapTable
    // wallet address => stakeholder_id
    mapping(address => bytes16) public override walletsPerStakeholder;

    ActivePositions positions;
    SecIdsStockClass activeSecs;

    // RBAC

    /// @inheritdoc ICapTable
    bytes32 public constant override ADMIN_ROLE = keccak256("ADMIN");
    /// @inheritdoc ICapTable
    bytes32 public constant override OPERATOR_ROLE = keccak256("OPERATOR");

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(bytes16 _id, string memory _name, uint256 _initial_shares_authorized) AccessControlDefaultAdminRules(0 seconds, _msgSender()) {
        _grantRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);

        nonce = 0;
        issuer = Issuer(_id, _name, 0, _initial_shares_authorized);
        emit IssuerCreated(_id, _name);
    }

    /// @inheritdoc ICapTable
    function seedMultipleActivePositionsAndSecurityIds(
        bytes16[] memory stakeholderIds,
        bytes16[] memory securityIds,
        bytes16[] memory stockClassIds,
        uint256[] memory quantities,
        uint256[] memory sharePrices,
        uint40[] memory timestamps
    ) external override onlyAdmin {
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

    /// @inheritdoc ICapTable
    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) public override onlyAdmin {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    /// @inheritdoc ICapTable
    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public override onlyAdmin {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] == bytes16(0), "Wallet already exists");

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @inheritdoc ICapTable
    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) public override onlyAdmin {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] != bytes16(0), "Wallet doesn't exist");

        delete walletsPerStakeholder[_wallet];
    }

    /// @inheritdoc ICapTable
    function getStakeholderIdByWallet(address _wallet) public view override returns (bytes16 stakeholderId) {
        require(walletsPerStakeholder[_wallet] != bytes16(0), "No stakeholder found");
        return walletsPerStakeholder[_wallet];
    }

    /// @inheritdoc ICapTable
    // Stock Acceptance does not currently impact an active position. It's only recorded.
    function acceptStock(bytes16 stakeholderId, bytes16 stockClassId, bytes16 securityId, string[] memory comments) external override onlyAdmin {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        // require active position to exist?

        StockAcceptanceLib.acceptStockByTA(nonce, securityId, comments, transactions);
    }

    /// @inheritdoc ICapTable
    function adjustIssuerAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external override onlyAdmin {
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

    /// @inheritdoc ICapTable
    function adjustStockClassAuthorizedShares(
        bytes16 stockClassId,
        uint256 newAuthorizedShares,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external override onlyAdmin {
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

    /// @inheritdoc ICapTable
    function createStockClass(
        bytes16 _id,
        string memory _class_type,
        uint256 _price_per_share,
        uint256 _initial_share_authorized
    ) public override onlyAdmin {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, 0, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    /// @inheritdoc ICapTable
    // Basic functionality of Stock Legend Template, unclear how it ties to active positions atm.
    function createStockLegendTemplate(bytes16 _id) public override onlyAdmin {
        stockLegendTemplates.push(StockLegendTemplate(_id));
    }

    /// @inheritdoc ICapTable
    function getStakeholderById(bytes16 _id) public view override returns (bytes16, string memory, string memory) {
        if (stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    /// @inheritdoc ICapTable
    function getStockClassById(bytes16 _id) public view override returns (bytes16, string memory, uint256, uint256) {
        if (stockClassIndex[_id] > 0) {
            StockClass memory stockClass = stockClasses[stockClassIndex[_id] - 1];
            return (stockClass.id, stockClass.class_type, stockClass.price_per_share, stockClass.shares_authorized);
        } else {
            return ("", "", 0, 0);
        }
    }

    /// @inheritdoc ICapTable
    function getTotalNumberOfStakeholders() public view override returns (uint256) {
        return stakeholders.length;
    }

    /// @inheritdoc ICapTable
    function getTotalNumberOfStockClasses() public view override returns (uint256) {
        return stockClasses.length;
    }

    /// @inheritdoc ICapTable
    // TODO: small syntax but change this to issueStock
    // string memory boardApprovalDate,
    // string memory stockholderApprovalDate,
    // string memory considerationText,
    // string[] memory securityLawExemptions
    function issueStockByTA(
        bytes16 stockClassId,
        // bytes16 stockPlanId,
        // ShareNumbersIssued memory shareNumbersIssued,
        uint256 sharePrice,
        uint256 quantity,
        // bytes16 vestingTermsId,
        // uint256 costBasis,
        // bytes16[] memory stockLegendIds,
        string memory issuanceType,
        // string[] memory comments,
        // string memory customId,
        bytes16 stakeholderId
    ) external onlyAdmin {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        StockClass storage stockClass = stockClasses[stockClassIndex[stockClassId] - 1];

        require(issuer.shares_issued.add(quantity) <= issuer.shares_authorized, "Issuer: Insufficient shares authorized");
        require(stockClass.shares_issued.add(quantity) <= stockClass.shares_authorized, "StockClass: Insufficient shares authorized");

        StockIssuanceLib.createStockIssuanceByTA(
            nonce,
            stockClassId,
            // stockPlanId,
            // shareNumbersIssued,
            sharePrice,
            quantity,
            // vestingTermsId,
            // costBasis,
            // stockLegendIds,
            issuanceType,
            // comments,
            // customId,
            stakeholderId,
            // boardApprovalDate,
            // stockholderApprovalDate,
            // considerationText,
            // securityLawExemptions,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClass
        );
    }

    /// @inheritdoc ICapTable
    function repurchaseStock(StockParamsQuantity memory params, uint256 price) external override onlyAdmin {
        require(stakeholderIndex[params.stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[params.stockClassId] > 0, "Invalid stock class");

        StockRepurchaseLib.repurchaseStockByTA(
            params,
            price,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stockClassId] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function retractStockIssuance(StockParams memory params) external override onlyAdmin {
        require(stakeholderIndex[params.stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[params.stockClassId] > 0, "Invalid stock class");

        StockRetractionLib.retractStockIssuanceByTA(
            params,
            nonce,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stockClassId] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function reissueStock(
        StockParams memory params,
        bytes16[] memory resulting_security_ids
    ) external override {
        StockReissuanceLib.reissueStockByTA(
            params,
            nonce,
            resulting_security_ids,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stockClassId] - 1]
        );
    }

    /// @inheritdoc ICapTable
    // Missed date here. Make sure it's recorded where it needs to be (in the struct)
    // TODO: dates seem to be missing in a handful of places, go back and recheck
    function cancelStock(StockParamsQuantity memory params) external override onlyAdmin {
        require(stakeholderIndex[params.stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[params.stockClassId] > 0, "Invalid stock class");

        // need a require for activePositions

        params.nonce = nonce;
        StockCancellationLib.cancelStockByTA(
            params,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stockClassId] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price
    ) external override onlyOperator {
        require(stakeholderIndex[transferorStakeholderId] > 0, "No transferor");
        require(stakeholderIndex[transfereeStakeholderId] > 0, "No transferee");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        StockTransferTransferParams memory params = StockTransferTransferParams(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            isBuyerVerified,
            quantity,
            share_price,
            nonce
        );

        StockTransferLib.transferStock(params, positions, activeSecs, transactions, issuer, stockClasses[stockClassIndex[stockClassId] - 1]);
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

    /// @inheritdoc ICapTable
    function addAdmin(address addr) external override onlyAdmin {
        _grantRole(ADMIN_ROLE, addr);
    }

    /// @inheritdoc ICapTable
    function removeAdmin(address addr) external override onlyAdmin {
        _revokeRole(ADMIN_ROLE, addr);
    }

    /// @inheritdoc ICapTable
    function addOperator(address addr) external override onlyAdmin {
        _grantRole(OPERATOR_ROLE, addr);
    }

    /// @inheritdoc ICapTable
    function removeOperator(address addr) external override onlyAdmin {
        _revokeRole(OPERATOR_ROLE, addr);
    }
}
