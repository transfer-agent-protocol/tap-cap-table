// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { CapTable } from "../../src/CapTable.sol";
import { CapTableFactory } from "../../src/CapTableFactory.sol";
import { CapTableHandler } from "./CapTableHandler.sol";

/// @title CapTableInvariants
/// @notice Invariant tests for the CapTable contract
/// @dev Tests critical share accounting and index consistency invariants
contract CapTableInvariants is Test {
    CapTable public capTable;
    CapTableFactory public factory;
    CapTableHandler public handler;

    address public admin = address(this);
    bytes16 public issuerId = bytes16(keccak256("test-issuer"));
    uint256 public initialSharesAuthorized = 10_000_000; // 10M shares

    function setUp() public {
        // Deploy implementation and factory
        CapTable implementation = new CapTable();
        factory = new CapTableFactory(address(implementation));

        // Create a cap table via factory
        address capTableAddr = factory.createCapTable(issuerId, "Test Issuer Inc.", initialSharesAuthorized);
        capTable = CapTable(capTableAddr);

        // Deploy handler
        handler = new CapTableHandler(capTable, factory, admin);

        // Set handler as the target contract for invariant testing
        targetContract(address(handler));

        // Exclude capTable and factory from direct fuzzing (only interact through handler)
        excludeContract(address(capTable));
        excludeContract(address(factory));
    }

    /// @notice Invariant: Issuer shares_issued must never exceed shares_authorized
    /// @dev This is the core accounting invariant for the issuer
    function invariant_issuerSharesIssuedNeverExceedsAuthorized() public view {
        (, , uint256 sharesIssued, uint256 sharesAuthorized) = capTable.issuer();
        assertLe(sharesIssued, sharesAuthorized, "Issuer shares_issued exceeds shares_authorized");
    }

    /// @notice Invariant: Each stock class's shares_issued must never exceed its shares_authorized
    /// @dev Checks all stock classes created during the fuzz campaign
    function invariant_stockClassSharesConsistency() public view {
        uint256 stockClassCount = handler.getStockClassCount();

        for (uint256 i = 0; i < stockClassCount; i++) {
            bytes16 stockClassId = handler.getStockClassId(i);
            (, , , uint256 sharesIssued, uint256 sharesAuthorized) = capTable.getStockClassById(stockClassId);

            assertLe(
                sharesIssued,
                sharesAuthorized,
                string(abi.encodePacked("Stock class shares_issued exceeds shares_authorized for class index ", i))
            );
        }
    }

    /// @notice Invariant: Stakeholder index mapping must be consistent
    /// @dev If stakeholderIndex[id] > 0, then stakeholders[index-1].id == id
    function invariant_stakeholderIndexConsistency() public view {
        uint256 stakeholderCount = handler.getStakeholderCount();

        for (uint256 i = 0; i < stakeholderCount; i++) {
            bytes16 stakeholderId = handler.getStakeholderId(i);

            // Check index mapping
            uint256 index = capTable.stakeholderIndex(stakeholderId);
            assertTrue(index > 0, "Stakeholder index should be > 0 for created stakeholder");

            // Verify the stakeholder at that index has the correct ID
            (bytes16 retrievedId, , ) = capTable.getStakeholderById(stakeholderId);
            assertEq(retrievedId, stakeholderId, "Stakeholder ID mismatch in index mapping");
        }
    }

    /// @notice Invariant: Stock class index mapping must be consistent
    /// @dev If stockClassIndex[id] > 0, then stockClasses[index-1].id == id
    function invariant_stockClassIndexConsistency() public view {
        uint256 stockClassCount = handler.getStockClassCount();

        for (uint256 i = 0; i < stockClassCount; i++) {
            bytes16 stockClassId = handler.getStockClassId(i);

            // Check index mapping
            uint256 index = capTable.stockClassIndex(stockClassId);
            assertTrue(index > 0, "Stock class index should be > 0 for created stock class");

            // Verify the stock class at that index has the correct ID
            (bytes16 retrievedId, , , , ) = capTable.getStockClassById(stockClassId);
            assertEq(retrievedId, stockClassId, "Stock class ID mismatch in index mapping");
        }
    }

    /// @notice Invariant: Total stakeholders count must match the handler's tracked count
    function invariant_stakeholderCountConsistency() public view {
        uint256 contractCount = capTable.getTotalNumberOfStakeholders();
        uint256 handlerCount = handler.getStakeholderCount();

        assertEq(contractCount, handlerCount, "Stakeholder count mismatch between contract and handler");
    }

    /// @notice Invariant: Total stock classes count must match the handler's tracked count
    function invariant_stockClassCountConsistency() public view {
        uint256 contractCount = capTable.getTotalNumberOfStockClasses();
        uint256 handlerCount = handler.getStockClassCount();

        assertEq(contractCount, handlerCount, "Stock class count mismatch between contract and handler");
    }

    /// @notice Invariant: Stock class shares_authorized must never exceed issuer shares_authorized
    /// @dev This ensures stock classes can't authorize more shares than the issuer has
    function invariant_stockClassAuthorizedNeverExceedsIssuer() public view {
        (, , , uint256 issuerAuthorized) = capTable.issuer();
        uint256 stockClassCount = handler.getStockClassCount();

        for (uint256 i = 0; i < stockClassCount; i++) {
            bytes16 stockClassId = handler.getStockClassId(i);
            (, , , , uint256 classAuthorized) = capTable.getStockClassById(stockClassId);

            assertLe(
                classAuthorized,
                issuerAuthorized,
                "Stock class authorized shares exceeds issuer authorized shares"
            );
        }
    }

    /// @notice Called after each invariant run - can be used for logging/metrics
    function afterInvariant() public view {
        // Invariant run completed successfully
        // Enable console.log statements below with -vvv for debugging
        // console.log("Stakeholders created:", handler.getStakeholderCount());
        // console.log("Stock classes created:", handler.getStockClassCount());
    }
}
