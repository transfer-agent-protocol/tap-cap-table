// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControlDefaultAdminRules } from "openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import { Issuer, Stakeholder, StockClass, ActivePositions, SecIdsStockClass, StockLegendTemplate, InitialShares, ShareNumbersIssued, StockParams, StockParamsQuantity, StockIssuanceParams, StockTransferParams } from "../lib/Structs.sol";

interface ICapTable {
    // @dev Transactions will be created on-chain then reflected off-chain.
    function transactions(uint256 index) external view returns (bytes memory);

    function stakeholderIndex(bytes16 index) external view returns (uint256);

    function stockClassIndex(bytes16 index) external view returns (uint256);

    function walletsPerStakeholder(address wallet) external view returns (bytes16);

    // RBAC
    function ADMIN_ROLE() external returns (bytes32);

    function OPERATOR_ROLE() external returns (bytes32);

    /// @notice Initializer for the CapTable, sets access control and initializes issuer struct.
    function initialize(bytes16 id, string memory name, uint256 initial_shares_authorized, address admin) external;

    function seedMultipleActivePositionsAndSecurityIds(
        bytes16[] calldata stakeholderIds,
        bytes16[] calldata securityIds,
        bytes16[] calldata stockClassIds,
        uint256[] calldata quantities,
        uint256[] calldata sharePrices,
        uint40[] calldata timestamps
    ) external;

    function seedSharesAuthorizedAndIssued(InitialShares calldata params) external;

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) external;

    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) external;

    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) external;

    function getStakeholderIdByWallet(address _wallet) external view returns (bytes16 stakeholderId);

    function acceptStock(bytes16 stakeholderId, bytes16 stockClassId, bytes16 securityId, string[] memory comments) external;

    function adjustIssuerAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external;

    function adjustStockClassAuthorizedShares(
        bytes16 stockClassId,
        uint256 newAuthorizedShares,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate
    ) external;

    function createStockClass(bytes16 _id, string memory _class_type, uint256 _price_per_share, uint256 _initial_share_authorized) external;

    function createStockLegendTemplate(bytes16 _id) external;

    function getStakeholderById(bytes16 _id) external view returns (bytes16, string memory, string memory);

    function getStockClassById(bytes16 _id) external view returns (bytes16, string memory, uint256, uint256, uint256);

    function getTotalNumberOfStakeholders() external view returns (uint256);

    function getTotalNumberOfStockClasses() external view returns (uint256);

    function getTransactionsCount() external view returns (uint256);

    function getTotalActiveSecuritiesCount() external view returns (uint256);

    // Function to get the timestamp of an active position
    function getActivePosition(bytes16 stakeholderId, bytes16 securityId) external view returns (bytes16, uint, uint, uint40);

    /// @notice Get the avg active position for the stakeholder by dividing the first return value (quantityPrice) by the second (quantity)
    ///  the timestamp is the time of the latest position
    function getAveragePosition(bytes16 stakeholderId, bytes16 stockClassId) external view returns (uint, uint, uint40);

    function issueStock(StockIssuanceParams calldata params) external;

    function repurchaseStock(StockParams calldata params, uint256 quantity, uint256 price) external;

    function retractStockIssuance(StockParams calldata params) external;

    /// Reissuance assumes an issuance transaction has been created and it's tied here under resulting_security_ids
    function reissueStock(StockParams calldata params, bytes16[] memory resulting_security_ids) external;

    function cancelStock(StockParams calldata params, uint256 quantity) external;

    function transferStock(StockTransferParams calldata params) external;

    function addAdmin(address addr) external;

    function removeAdmin(address addr) external;

    function addOperator(address addr) external;

    function removeOperator(address addr) external;
}
