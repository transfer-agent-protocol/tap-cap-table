// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import {AccessControlDefaultAdminRules} from
    "openzeppelin-contracts/contracts/access/AccessControlDefaultAdminRules.sol";

struct Issuer {
    bytes16 id;
    string legal_name;
    uint256 shares_issued;
    uint256 shares_authorized;
}

contract CapTableDemo is AccessControlDefaultAdminRules {
    using SafeMath for uint256;

    Issuer public issuer;
    uint256 private nonce;

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
}
