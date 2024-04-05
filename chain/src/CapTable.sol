// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControlDefaultAdminRulesUpgradeable } from "openzeppelin-upgradeable/contracts/access/AccessControlDefaultAdminRulesUpgradeable.sol";

import { ICapTable } from "./interfaces/ICapTable.sol";
import { StockTransferParams, Issuer, Stakeholder, StockClass, InitialShares, ActivePositions, SecIdsStockClass, StockLegendTemplate, StockParams, StockParamsQuantity, StockIssuanceParams } from "./lib/Structs.sol";
import "./lib/transactions/Adjustment.sol";
import "./lib/Stock.sol";

contract CapTable is ICapTable, AccessControlDefaultAdminRulesUpgradeable {
    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    StockLegendTemplate[] public stockLegendTemplates;

    /// @inheritdoc ICapTable
    bytes[] public override transactions;

    /// @dev Used to help generate deterministic UUIDs
    uint256 public nonce;

    /// @inheritdoc ICapTable
    mapping(bytes16 => uint256) public override stakeholderIndex;
    /// @inheritdoc ICapTable
    mapping(bytes16 => uint256) public override stockClassIndex;
    /// @inheritdoc ICapTable
    mapping(address => bytes16) public override walletsPerStakeholder;

    ActivePositions positions;
    SecIdsStockClass activeSecs;

    /// @inheritdoc ICapTable
    bytes32 public constant override ADMIN_ROLE = keccak256("ADMIN");
    /// @inheritdoc ICapTable
    bytes32 public constant override OPERATOR_ROLE = keccak256("OPERATOR");

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    error StakeholderAlreadyExists(bytes16 stakeholder_id);
    error StockClassAlreadyExists(bytes16 stock_class_id);
    error StockClassDoesNotExist(bytes16 stock_class_id);
    error InvalidWallet(address wallet);
    error NoStakeholder(bytes16 stakeholder_id);
    error InvalidStockClass(bytes16 stock_class_id);
    error InsufficientIssuerSharesAuthorized();
    error InsufficientStockClassSharesAuthorized();
    error NoIssuanceFound();
    error WalletAlreadyExists(address wallet);
    error NoActivePositionFound();

    constructor() {
        _disableInitializers();
    }

    function initialize(bytes16 id, string memory name, uint256 initial_shares_authorized, address admin) external initializer {
        __AccessControlDefaultAdminRules_init(0 seconds, admin);
        _grantRole(ADMIN_ROLE, admin);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);

        issuer = Issuer(id, name, 0, initial_shares_authorized);
        emit IssuerCreated(id, name);
    }

    /// @inheritdoc ICapTable
    function getTransactionsCount() external view returns (uint256) {
        return transactions.length;
    }

    /// @inheritdoc ICapTable
    function getTotalActiveSecuritiesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < stakeholders.length; i++) {
            for (uint256 j = 0; j < stockClasses.length; j++) {
                count += activeSecs.activeSecurityIdsByStockClass[stakeholders[i].id][stockClasses[j].id].length;
            }
        }
        return count;
    }

    /// @inheritdoc ICapTable
    function seedSharesAuthorizedAndIssued(InitialShares calldata params) external override {
        require(
            params.issuerInitialShares.shares_authorized > 0 &&
                params.issuerInitialShares.shares_issued > 0 &&
                params.stockClassesInitialShares.length > 0,
            "Invalid Seeding Shares Params"
        );

        issuer.shares_authorized = params.issuerInitialShares.shares_authorized;
        issuer.shares_issued = params.issuerInitialShares.shares_issued;

        for (uint256 i = 0; i < params.stockClassesInitialShares.length; i++) {
            bytes16 stockClassId = params.stockClassesInitialShares[i].id;
            _checkInvalidStockClass(stockClassId);

            uint256 index = stockClassIndex[stockClassId] - 1;
            stockClasses[index].shares_authorized = params.stockClassesInitialShares[i].shares_authorized;
            stockClasses[index].shares_issued = params.stockClassesInitialShares[i].shares_issued;
        }
    }

    /// @inheritdoc ICapTable
    function seedMultipleActivePositionsAndSecurityIds(
        bytes16[] calldata stakeholderIds,
        bytes16[] calldata securityIds,
        bytes16[] calldata stockClassIds,
        uint256[] calldata quantities,
        uint256[] calldata sharePrices,
        uint40[] calldata timestamps
    ) external override onlyAdmin {
        require(
            stakeholderIds.length == securityIds.length &&
                securityIds.length == stockClassIds.length &&
                stockClassIds.length == quantities.length &&
                quantities.length == sharePrices.length &&
                sharePrices.length == timestamps.length,
            "Input arrays must have the same length"
        );

        for (uint256 i = 0; i < stakeholderIds.length; i++) {
            // perform requires to ensure valid stakeholders and stock classes
            _checkStakeholderIsStored(stakeholderIds[i]);
            _checkInvalidStockClass(stockClassIds[i]);
            positions.activePositions[stakeholderIds[i]][securityIds[i]] = ActivePosition(
                stockClassIds[i],
                quantities[i],
                sharePrices[i],
                timestamps[i]
            );

            activeSecs.activeSecurityIdsByStockClass[stakeholderIds[i]][stockClassIds[i]].push(securityIds[i]);
        }
    }

    /// @inheritdoc ICapTable
    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) external override onlyAdmin {
        _checkStakeholderExists(_id);

        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    /// @inheritdoc ICapTable
    function createStockClass(
        bytes16 _id,
        string memory _class_type,
        uint256 _price_per_share,
        uint256 _initial_share_authorized
    ) external override onlyAdmin {
        _checkStockClassExists(_id);

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, 0, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    /// @inheritdoc ICapTable
    // Basic functionality of Stock Legend Template, unclear how it ties to active positions.
    function createStockLegendTemplate(bytes16 _id) external override onlyAdmin {
        stockLegendTemplates.push(StockLegendTemplate(_id));
    }

    /// @inheritdoc ICapTable
    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) external override onlyOperator {
        _checkInvalidWallet(_wallet);
        _checkStakeholderIsStored(_stakeholder_id);
        _checkWalletAlreadyExists(_wallet);

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @inheritdoc ICapTable
    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) external override onlyOperator {
        _checkInvalidWallet(_wallet);
        _checkStakeholderIsStored(_stakeholder_id);

        delete walletsPerStakeholder[_wallet];
    }

    /// @inheritdoc ICapTable
    function issueStock(StockIssuanceParams calldata params) external override onlyOperator {
        _checkStakeholderIsStored(params.stakeholder_id);
        _checkInvalidStockClass(params.stock_class_id);

        StockClass storage stockClass = stockClasses[stockClassIndex[params.stock_class_id] - 1];

        require(issuer.shares_issued + params.quantity <= issuer.shares_authorized, "Issuer: Insufficient shares authorized");
        require(stockClass.shares_issued + params.quantity <= stockClass.shares_authorized, "StockClass: Insufficient shares authorized");

        nonce++;

        StockLib.createIssuance(nonce, params, positions, activeSecs, transactions, issuer, stockClass);
    }

    /// @inheritdoc ICapTable
    function repurchaseStock(StockParams calldata params, uint256 quantity, uint256 price) external override onlyOperator {
        _checkStakeholderIsStored(params.stakeholder_id);
        _checkInvalidStockClass(params.stock_class_id);

        nonce++;

        StockParamsQuantity memory repurchaseParams = StockParamsQuantity(
            nonce,
            quantity,
            params.stakeholder_id,
            params.stock_class_id,
            params.security_id,
            params.comments,
            params.reason_text
        );

        StockLib.createRepurchase(
            repurchaseParams,
            price,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stock_class_id] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function retractStockIssuance(StockParams calldata params) external override onlyOperator {
        _checkStakeholderIsStored(params.stakeholder_id);
        _checkInvalidStockClass(params.stock_class_id);

        nonce++;

        StockLib.createRetraction(
            params,
            nonce,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stock_class_id] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function reissueStock(StockParams calldata params, bytes16[] memory resulting_security_ids) external override onlyOperator {
        _checkStakeholderIsStored(params.stakeholder_id);
        _checkInvalidStockClass(params.stock_class_id);
        _checkResultingSecurityIds(resulting_security_ids, params.stakeholder_id, params.stock_class_id);

        nonce++;

        StockLib.createReissuance(
            params,
            nonce,
            resulting_security_ids,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stock_class_id] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function cancelStock(StockParams calldata params, uint256 quantity) external override onlyOperator {
        _checkStakeholderIsStored(params.stakeholder_id);
        _checkInvalidStockClass(params.stock_class_id);

        nonce++;

        StockParamsQuantity memory cancelParams = StockParamsQuantity(
            nonce,
            quantity,
            params.stakeholder_id,
            params.stock_class_id,
            params.security_id,
            params.comments,
            params.reason_text
        );

        StockLib.createCancellation(
            cancelParams,
            positions,
            activeSecs,
            transactions,
            issuer,
            stockClasses[stockClassIndex[params.stock_class_id] - 1]
        );
    }

    /// @inheritdoc ICapTable
    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        bool isBuyerVerified,
        uint256 quantity,
        uint256 sharePrice,
        string memory customId
    ) external override onlyOperator {
        _checkStakeholderIsStored(transferorStakeholderId);
        _checkStakeholderIsStored(transfereeStakeholderId);
        _checkInvalidStockClass(stockClassId);

        nonce++;

        StockTransferParams memory params = StockTransferParams(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            isBuyerVerified,
            quantity,
            sharePrice,
            nonce,
            customId
        );

        StockLib.createTransfer(params, positions, activeSecs, transactions, issuer, stockClasses[stockClassIndex[stockClassId] - 1]);
    }

    /// @inheritdoc ICapTable
    // Stock Acceptance does not impact an active position. It's only recorded.
    function acceptStock(bytes16 stakeholderId, bytes16 stockClassId, bytes16 securityId, string[] memory comments) external override onlyOperator {
        _checkStakeholderIsStored(stakeholderId);
        _checkInvalidStockClass(stockClassId);

        nonce++;

        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        _checkActivePositionExists(activePosition);

        StockLib.createAcceptance(nonce, securityId, comments, transactions);
    }

    /// @inheritdoc ICapTable
    function adjustIssuerAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external override onlyAdmin {
        require(newSharesAuthorized >= issuer.shares_issued, "InsufficientIssuerSharesAuthorized: shares_issued exceeds newSharesAuthorized");

        nonce++;

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
        _checkInvalidStockClass(stockClassId);
        // check that the new stock class authorized is less than the issuer authorized if not revert
        require(
            newAuthorizedShares <= issuer.shares_authorized,
            "InsufficientStockClassSharesAuthorized: stock class authorized shares exceeds issuer shares authorized"
        );

        nonce++;

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
    function getStakeholderById(bytes16 _id) external view override returns (bytes16, string memory, string memory) {
        if (stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    /// @inheritdoc ICapTable
    function getStockClassById(bytes16 _id) external view override returns (bytes16, string memory, uint256, uint256, uint256) {
        if (stockClassIndex[_id] > 0) {
            StockClass memory stockClass = stockClasses[stockClassIndex[_id] - 1];
            return (stockClass.id, stockClass.class_type, stockClass.price_per_share, stockClass.shares_issued, stockClass.shares_authorized);
        } else {
            return ("", "", 0, 0, 0);
        }
    }

    /// @inheritdoc ICapTable
    function getStakeholderIdByWallet(address _wallet) external view override returns (bytes16 stakeholderId) {
        require(walletsPerStakeholder[_wallet] != bytes16(0), "No stakeholder found");
        return walletsPerStakeholder[_wallet];
    }

    /// @inheritdoc ICapTable
    function getTotalNumberOfStakeholders() external view override returns (uint256) {
        return stakeholders.length;
    }

    /// @inheritdoc ICapTable
    function getTotalNumberOfStockClasses() external view override returns (uint256) {
        return stockClasses.length;
    }

    /// @inheritdoc ICapTable
    function getActivePosition(bytes16 stakeholderId, bytes16 securityId) external view returns (bytes16, uint, uint, uint40) {
        ActivePosition storage position = positions.activePositions[stakeholderId][securityId];
        return (position.stock_class_id, position.quantity, position.share_price, position.timestamp);
    }

    /// @inheritdoc ICapTable
    function getAveragePosition(bytes16 stakeholderId, bytes16 stockClassId) external view returns (uint, uint, uint40) {
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[stakeholderId][stockClassId];
        uint quantityPrice = 0;
        uint quantity = 0;
        uint40 timestamp = 0;
        for (uint i = 0; i < activeSecurityIDs.length; i++) {
            ActivePosition storage position = positions.activePositions[stakeholderId][activeSecurityIDs[i]];
            // Alley-oop the web2 caller to find the avg to avoid issues with fractions
            quantityPrice += position.quantity * position.share_price;
            quantity += position.quantity;
            timestamp = position.timestamp > timestamp ? position.timestamp : timestamp;
        }
        return (quantityPrice, quantity, timestamp);
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

    function _checkStakeholderExists(bytes16 _id) internal view {
        if (stakeholderIndex[_id] > 0) {
            revert StakeholderAlreadyExists(_id);
        }
    }

    function _checkStockClassExists(bytes16 _id) internal view {
        if (stockClassIndex[_id] > 0) {
            revert StockClassAlreadyExists(_id);
        }
    }

    function _checkInvalidWallet(address _wallet) internal pure {
        if (_wallet == address(0)) {
            revert InvalidWallet(_wallet);
        }
    }

    function _checkStakeholderIsStored(bytes16 _id) internal view {
        if (stakeholderIndex[_id] == 0) {
            revert NoStakeholder(_id);
        }
    }

    function _checkWalletAlreadyExists(address _wallet) internal view {
        if (walletsPerStakeholder[_wallet] != bytes16(0)) {
            revert WalletAlreadyExists(_wallet);
        }
    }

    function _checkInvalidStockClass(bytes16 _stock_class_id) internal view {
        if (stockClassIndex[_stock_class_id] == 0) {
            revert InvalidStockClass(_stock_class_id);
        }
    }

    function _checkResultingSecurityIds(bytes16[] memory resulting_security_ids, bytes16 stakeholder_id, bytes16 stock_class_id) internal view {
        if (resulting_security_ids.length == 0) {
            revert NoIssuanceFound();
        }

        bytes16 security_id = resulting_security_ids[0];
        ActivePosition memory activePosition = positions.activePositions[stakeholder_id][security_id];

        if (activePosition.quantity == 0 || activePosition.stock_class_id != stock_class_id) {
            revert NoActivePositionFound();
        }
    }

    function _checkActivePositionExists(ActivePosition memory activePosition) internal pure {
        if (activePosition.quantity == 0) {
            revert NoActivePositionFound();
        }
    }
}
