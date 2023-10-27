// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import {AccessControlDefaultAdminRules} from
    "openzeppelin-contracts/contracts/access/AccessControlDefaultAdminRules.sol";
import {
    StockIssuance,
    ActivePosition,
    ActivePositions,
    Stakeholder,
    SecIdsStockClass,
    Issuer,
    StockClass
} from "./lib/Structs.sol";
import "./lib/transactions/StockIssuance.sol";

contract CapTableDemo is AccessControlDefaultAdminRules {
    using SafeMath for uint256;

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public transactions;

    uint256 private nonce;

    mapping(bytes16 => uint256) stakeholderIndex;
    mapping(bytes16 => uint256) stockClassIndex;
    // wallet address => stakeholder_id
    mapping(address => bytes16) walletsPerStakeholder;

    ActivePositions positions;
    SecIdsStockClass activeSecs;

    // RBAC
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(
        bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized
    );

    constructor(bytes16 _id, string memory _name, uint256 _initial_shares_authorized)
        AccessControlDefaultAdminRules(0 seconds, _msgSender())
    {
        _grantRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);

        nonce = 0;
        issuer = Issuer(_id, _name, 0, _initial_shares_authorized);
        emit IssuerCreated(_id, _name);
    }

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

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship)
        public
        onlyAdmin
    {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    function createStockClass(
        bytes16 _id,
        string memory _class_type,
        uint256 _price_per_share,
        uint256 _initial_share_authorized
    ) public onlyAdmin {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, 0, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }
    // TODO: small syntax but change this to issueStock

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

        StockClass storage stockClass = stockClasses[stockClassIndex[stockClassId] - 1];

        require(
            issuer.shares_issued.add(quantity) <= issuer.shares_authorized, "Issuer: Insufficient shares authorized"
        );
        require(
            stockClass.shares_issued.add(quantity) <= stockClass.shares_authorized,
            "StockClass: Insufficient shares authorized"
        );

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
            transactions,
            issuer,
            stockClass
        );
    }
}
