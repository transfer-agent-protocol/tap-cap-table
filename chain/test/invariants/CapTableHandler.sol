// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { Test } from "forge-std/Test.sol";
import { CapTable } from "../../src/CapTable.sol";
import { CapTableFactory } from "../../src/CapTableFactory.sol";
import { StockIssuanceParams, ShareNumbersIssued, StockParams, StockTransferParams } from "../../src/lib/Structs.sol";

/// @title CapTableHandler
/// @notice Handler contract for invariant testing - wraps CapTable functions with bounded inputs
/// @dev Uses ghost variables to track cumulative state for invariant assertions
contract CapTableHandler is Test {
    CapTable public capTable;
    CapTableFactory public factory;
    address public admin;

    // Ghost variables for tracking state
    uint256 public ghost_totalSharesIssued;
    uint256 public ghost_stakeholderCount;
    uint256 public ghost_stockClassCount;

    // Track created IDs for use in subsequent calls
    bytes16[] public stakeholderIds;
    bytes16[] public stockClassIds;
    bytes16[] public securityIds;

    // Counters for generating unique IDs
    uint256 private stakeholderNonce;
    uint256 private stockClassNonce;

    // Constants for bounding
    uint256 constant MAX_SHARES = 1e12; // 1 trillion max shares
    uint256 constant MIN_PRICE = 1; // Minimum price per share
    uint256 constant MAX_PRICE = 1e10; // Max price per share

    constructor(CapTable _capTable, CapTableFactory _factory, address _admin) {
        capTable = _capTable;
        factory = _factory;
        admin = _admin;
    }

    /// @notice Create a new stakeholder with bounded inputs
    function createStakeholder(uint256 typeSeed, uint256 relationshipSeed) external {
        // Generate deterministic unique ID
        stakeholderNonce++;
        bytes16 id = bytes16(keccak256(abi.encodePacked("stakeholder", stakeholderNonce, block.timestamp)));

        // Bound stakeholder type
        string memory stakeholderType = typeSeed % 2 == 0 ? "INDIVIDUAL" : "INSTITUTION";

        // Bound relationship type
        string[] memory relationships = new string[](5);
        relationships[0] = "EMPLOYEE";
        relationships[1] = "FOUNDER";
        relationships[2] = "INVESTOR";
        relationships[3] = "ADVISOR";
        relationships[4] = "BOARD_MEMBER";
        string memory relationship = relationships[relationshipSeed % 5];

        vm.prank(admin);
        try capTable.createStakeholder(id, stakeholderType, relationship) {
            stakeholderIds.push(id);
            ghost_stakeholderCount++;
        } catch {
            // Stakeholder creation failed (e.g., duplicate ID) - acceptable
        }
    }

    /// @notice Create a new stock class with bounded inputs
    /// @dev Stock class authorized shares should not exceed issuer authorized shares
    function createStockClass(uint256 priceSeed, uint256 authorizedSeed) external {
        // Generate deterministic unique ID
        stockClassNonce++;
        bytes16 id = bytes16(keccak256(abi.encodePacked("stockClass", stockClassNonce, block.timestamp)));

        // Get issuer authorized shares to bound stock class authorized
        (, , , uint256 issuerAuthorized) = capTable.issuer();
        
        uint256 pricePerShare = bound(priceSeed, MIN_PRICE, MAX_PRICE);
        // Stock class authorized should not exceed issuer authorized (business invariant)
        uint256 maxAuthorized = issuerAuthorized > 0 ? issuerAuthorized : MAX_SHARES;
        uint256 sharesAuthorized = bound(authorizedSeed, 1, maxAuthorized);

        vm.prank(admin);
        try capTable.createStockClass(id, "COMMON", pricePerShare, sharesAuthorized) {
            stockClassIds.push(id);
            ghost_stockClassCount++;
        } catch {
            // Stock class creation failed - acceptable
        }
    }

    /// @notice Issue stock to a stakeholder with bounded inputs
    function issueStock(uint256 stakeholderIndex, uint256 stockClassIndex, uint256 quantitySeed, uint256 priceSeed) external {
        // Need at least one stakeholder and stock class
        if (stakeholderIds.length == 0 || stockClassIds.length == 0) return;

        // Bound indices to valid range
        uint256 shIdx = stakeholderIndex % stakeholderIds.length;
        uint256 scIdx = stockClassIndex % stockClassIds.length;

        bytes16 stakeholderId = stakeholderIds[shIdx];
        bytes16 stockClassId = stockClassIds[scIdx];

        // Get stock class info to bound quantity properly
        (, , , uint256 sharesIssued, uint256 sharesAuthorized) = capTable.getStockClassById(stockClassId);
        uint256 availableShares = sharesAuthorized > sharesIssued ? sharesAuthorized - sharesIssued : 0;

        if (availableShares == 0) return;

        uint256 quantity = bound(quantitySeed, 1, availableShares);
        uint256 sharePrice = bound(priceSeed, MIN_PRICE, MAX_PRICE);

        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: bytes16(0),
            share_numbers_issued: ShareNumbersIssued({ starting_share_number: 0, ending_share_number: 0 }),
            share_price: sharePrice,
            quantity: quantity,
            vesting_terms_id: bytes16(0),
            cost_basis: 0,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "",
            stakeholder_id: stakeholderId,
            board_approval_date: "",
            stockholder_approval_date: "",
            consideration_text: "",
            security_law_exemptions: new string[](0)
        });

        vm.prank(admin);
        try capTable.issueStock(params) {
            ghost_totalSharesIssued += quantity;
        } catch {
            // Issuance failed - acceptable (e.g., insufficient authorized shares)
        }
    }

    /// @notice Adjust issuer authorized shares
    /// @dev Must also ensure new authorized >= max stock class authorized (contract bug: this isn't enforced)
    function adjustIssuerAuthorizedShares(uint256 newSharesSeed) external {
        // Get current issuer state
        (, , uint256 sharesIssued, ) = capTable.issuer();

        // Find the maximum stock class authorized shares
        uint256 maxStockClassAuthorized = 0;
        for (uint256 i = 0; i < stockClassIds.length; i++) {
            (, , , , uint256 classAuthorized) = capTable.getStockClassById(stockClassIds[i]);
            if (classAuthorized > maxStockClassAuthorized) {
                maxStockClassAuthorized = classAuthorized;
            }
        }

        // New authorized must be >= shares issued AND >= max stock class authorized
        // Note: The contract only enforces the first constraint, but the second is a business invariant
        uint256 minShares = sharesIssued > maxStockClassAuthorized ? sharesIssued : maxStockClassAuthorized;
        if (minShares == 0) minShares = 1;
        
        uint256 newAuthorized = bound(newSharesSeed, minShares, MAX_SHARES);

        string[] memory comments = new string[](0);

        vm.prank(admin);
        try capTable.adjustIssuerAuthorizedShares(newAuthorized, comments, "", "") {
            // Success
        } catch {
            // Adjustment failed - acceptable
        }
    }

    /// @notice Adjust stock class authorized shares
    function adjustStockClassAuthorizedShares(uint256 stockClassIndex, uint256 newSharesSeed) external {
        if (stockClassIds.length == 0) return;

        uint256 scIdx = stockClassIndex % stockClassIds.length;
        bytes16 stockClassId = stockClassIds[scIdx];

        (, , , uint256 sharesIssued, ) = capTable.getStockClassById(stockClassId);
        (, , , uint256 issuerAuthorized) = capTable.issuer();

        // New authorized must be >= shares issued and <= issuer authorized
        uint256 minShares = sharesIssued > 0 ? sharesIssued : 1;
        uint256 maxShares = issuerAuthorized > minShares ? issuerAuthorized : minShares;
        uint256 newAuthorized = bound(newSharesSeed, minShares, maxShares);

        string[] memory comments = new string[](0);

        vm.prank(admin);
        try capTable.adjustStockClassAuthorizedShares(stockClassId, newAuthorized, comments, "", "") {
            // Success
        } catch {
            // Adjustment failed - acceptable
        }
    }

    // Helper getters for invariant tests
    function getStakeholderCount() external view returns (uint256) {
        return stakeholderIds.length;
    }

    function getStockClassCount() external view returns (uint256) {
        return stockClassIds.length;
    }

    function getStakeholderId(uint256 index) external view returns (bytes16) {
        require(index < stakeholderIds.length, "Index out of bounds");
        return stakeholderIds[index];
    }

    function getStockClassId(uint256 index) external view returns (bytes16) {
        require(index < stockClassIds.length, "Index out of bounds");
        return stockClassIds[index];
    }
}
