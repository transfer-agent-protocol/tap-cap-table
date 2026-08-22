// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.30;

import { InitialShares, StockParams, StockIssuanceParams, StockTransferParams } from "../lib/Structs.sol";

interface ICapTable {
    /// @dev Onchain ledger entries; the poller mirrors these offchain. Index is 0-based.
    function transactions(uint256 index) external view returns (bytes memory);

    /// @dev 0 means missing; stored value is array index + 1.
    function stakeholderIndex(bytes16 index) external view returns (uint256);

    /// @dev 0 means missing; stored value is array index + 1.
    function stockClassIndex(bytes16 index) external view returns (uint256);

    function walletsPerStakeholder(address wallet) external view returns (bytes16);

    function ADMIN_ROLE() external returns (bytes32);

    function OPERATOR_ROLE() external returns (bytes32);

    /// @notice Sets admin, optional operator, and the issuer's authorized share cap.
    /// @param operator Address to grant OPERATOR_ROLE (pass address(0) to skip)
    function initialize(bytes16 id, string memory name, uint256 initial_shares_authorized, address admin, address operator) external;

    /// @notice Imports live certificates after `mintSharesAuthorized`.
    /// @dev One-shot. Quantities must match the seeded issued counters. Reverts if positions or ledger txs already exist.
    function mintActivePositions(
        bytes16[] calldata stakeholderIds,
        bytes16[] calldata securityIds,
        bytes16[] calldata stockClassIds,
        uint256[] calldata quantities,
        uint256[] calldata sharePrices,
        uint40[] calldata timestamps
    ) external;

    /// @notice Imports issuer and stock-class authorized/issued counters.
    /// @dev One-shot. Must include every current stock class. Reverts if already seeded.
    function mintSharesAuthorized(InitialShares calldata params) external;

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) external;

    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) external;

    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) external;

    function getStakeholderIdByWallet(address _wallet) external view returns (bytes16 stakeholderId);

    /// @dev Records acceptance only; does not change holdings.
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

    /// @dev Quantity 0 means no live lot.
    function getActivePosition(bytes16 stakeholderId, bytes16 securityId) external view returns (bytes16, uint256, uint256, uint40);

    /// @notice Weighted totals for a stakeholder in one stock class.
    /// @dev Returns (sum(quantity * price), sum(quantity), latest timestamp).
    ///      Caller divides the first by the second. The contract does not divide, to avoid truncating the average.
    function getAveragePosition(bytes16 stakeholderId, bytes16 stockClassId) external view returns (uint256, uint256, uint40);

    function issueStock(StockIssuanceParams calldata params) external;

    function repurchaseStock(StockParams calldata params, uint256 quantity, uint256 price) external;

    function retractStockIssuance(StockParams calldata params) external;

    /// @dev `resulting_security_ids` must already be live positions for this stakeholder and class. This call only retires `security_id`.
    function reissueStock(StockParams calldata params, bytes16[] memory resulting_security_ids) external;

    function cancelStock(StockParams calldata params, uint256 quantity) external;

    function transferStock(StockTransferParams calldata params) external;

    function addAdmin(address addr) external;

    function removeAdmin(address addr) external;

    function addOperator(address addr) external;

    function removeOperator(address addr) external;
}
