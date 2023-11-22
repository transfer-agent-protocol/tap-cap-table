// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { AccessControlDefaultAdminRules } from "openzeppelin-contracts/contracts/access/AccessControlDefaultAdminRules.sol";
import { Issuer, Stakeholder, StockClass, ActivePositions, SecIdsStockClass, StockLegendTemplate, InitialShares, ShareNumbersIssued, StockParams, StockParamsQuantity, StockIssuanceParams } from "./lib/Structs.sol";

interface ICapTable {
    // @dev Transactions will be created on-chain then reflected off-chain.
    function transactions(uint256 index) external view returns (bytes memory);

    function stakeholderIndex(bytes16 index) external view returns (uint256);

    function stockClassIndex(bytes16 index) external view returns (uint256);

    function walletsPerStakeholder(address wallet) external view returns (bytes16);

    // RBAC
    function ADMIN_ROLE() external returns (bytes32);

    function OPERATOR_ROLE() external returns (bytes32);

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

    function issueStock(StockIssuanceParams calldata params) external;

    function repurchaseStock(StockParams calldata params, uint256 quantity, uint256 price) external;

    function retractStockIssuance(StockParams calldata params) external;

    function reissueStock(StockParams calldata params, bytes16[] memory resulting_security_ids) external;

    function cancelStock(StockParams calldata params, uint256 quantity) external;

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price
    ) external;

    function addAdmin(address addr) external;

    function removeAdmin(address addr) external;

    function addOperator(address addr) external;

    function removeOperator(address addr) external;
}
