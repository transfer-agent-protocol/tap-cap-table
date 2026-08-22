// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { Test } from "forge-std/Test.sol";
import { CapTable } from "../../src/CapTable.sol";
import { CapTableFactory } from "../../src/CapTableFactory.sol";
import {
    InitialShares,
    IssuerInitialShares,
    ShareNumbersIssued,
    StockClassInitialShares,
    StockIssuance,
    StockIssuanceParams,
    StockParams,
    StockTransferParams
} from "../../src/lib/Structs.sol";

/// @title CapTableHandler
/// @notice Handler contract for invariant testing - wraps CapTable functions with bounded inputs
contract CapTableHandler is Test {
    struct LiveLot {
        bytes16 stakeholderId;
        bytes16 stockClassId;
        bytes16 securityId;
    }

    CapTable public capTable;
    CapTableFactory public factory;
    address public admin;
    CapTableIssuanceDecoder public immutable issuanceDecoder;

    bytes16[] public stakeholderIds;
    bytes16[] public stockClassIds;
    LiveLot[] private lots;

    uint256 private stakeholderNonce;
    uint256 private stockClassNonce;
    uint256 private securityNonce;

    uint256 constant MAX_SHARES = 1e12;
    uint256 constant MIN_PRICE = 1;
    uint256 constant MAX_PRICE = 1e10;

    bytes32 private constant ISSUANCE_OBJECT_TYPE = keccak256("TX_STOCK_ISSUANCE");

    constructor(CapTable _capTable, CapTableFactory _factory, address _admin) {
        capTable = _capTable;
        factory = _factory;
        admin = _admin;
        issuanceDecoder = new CapTableIssuanceDecoder();
    }

    function createStakeholder(uint256 typeSeed, uint256 relationshipSeed) external {
        stakeholderNonce++;
        bytes16 id = bytes16(keccak256(abi.encodePacked("stakeholder", stakeholderNonce, block.timestamp)));

        string memory stakeholderType = typeSeed % 2 == 0 ? "INDIVIDUAL" : "INSTITUTION";

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
        } catch {}
    }

    function createStockClass(uint256 priceSeed, uint256 authorizedSeed) external {
        stockClassNonce++;
        bytes16 id = bytes16(keccak256(abi.encodePacked("stockClass", stockClassNonce, block.timestamp)));

        (, , , uint256 issuerAuthorized) = capTable.issuer();

        uint256 pricePerShare = bound(priceSeed, MIN_PRICE, MAX_PRICE);
        uint256 maxAuthorized = issuerAuthorized > 0 ? issuerAuthorized : MAX_SHARES;
        uint256 sharesAuthorized = bound(authorizedSeed, 1, maxAuthorized);

        vm.prank(admin);
        try capTable.createStockClass(id, "COMMON", pricePerShare, sharesAuthorized) {
            stockClassIds.push(id);
        } catch {}
    }

    function issueStock(uint256 stakeholderIndex, uint256 stockClassIndex, uint256 quantitySeed, uint256 priceSeed) external {
        if (stakeholderIds.length == 0 || stockClassIds.length == 0) return;

        uint256 shIdx = stakeholderIndex % stakeholderIds.length;
        uint256 scIdx = stockClassIndex % stockClassIds.length;

        bytes16 stakeholderId = stakeholderIds[shIdx];
        bytes16 stockClassId = stockClassIds[scIdx];

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

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.issueStock(params) {
            _syncLots(txBefore);
        } catch {}
    }

    /// @notice Seed all current stock classes with matching active positions before normal transactions begin.
    function seedInitialShares(uint256 issuedSeed, uint256 priceSeed) external {
        if (stakeholderIds.length == 0 || stockClassIds.length == 0) return;

        (, , uint256 issuerSharesIssued, uint256 issuerSharesAuthorized) = capTable.issuer();
        if (issuerSharesIssued != 0 || capTable.getTransactionsCount() != 0 || capTable.getTotalActiveSecuritiesCount() != 0) return;

        uint256 stockClassCount = stockClassIds.length;
        StockClassInitialShares[] memory stockClassInitialShares = new StockClassInitialShares[](stockClassCount);
        bytes16[] memory seededStakeholderIds = new bytes16[](stockClassCount);
        bytes16[] memory seededSecurityIds = new bytes16[](stockClassCount);
        bytes16[] memory seededStockClassIds = new bytes16[](stockClassCount);
        uint256[] memory seededQuantities = new uint256[](stockClassCount);
        uint256[] memory seededSharePrices = new uint256[](stockClassCount);
        uint40[] memory seededTimestamps = new uint40[](stockClassCount);
        uint256 totalSharesIssued = 0;

        for (uint256 i = 0; i < stockClassCount; i++) {
            bytes16 stockClassId = stockClassIds[i];
            (, , , uint256 classSharesIssued, uint256 classSharesAuthorized) = capTable.getStockClassById(stockClassId);
            if (classSharesIssued != 0) return;

            uint256 classSeededShares = bound(uint256(keccak256(abi.encodePacked(issuedSeed, i))), 1, classSharesAuthorized);
            totalSharesIssued += classSeededShares;
            securityNonce++;

            stockClassInitialShares[i] = StockClassInitialShares({
                id: stockClassId,
                shares_authorized: classSharesAuthorized,
                shares_issued: classSeededShares
            });
            seededStakeholderIds[i] = stakeholderIds[i % stakeholderIds.length];
            seededSecurityIds[i] = bytes16(keccak256(abi.encodePacked("seed-security", securityNonce)));
            seededStockClassIds[i] = stockClassId;
            seededQuantities[i] = classSeededShares;
            seededSharePrices[i] = bound(priceSeed, MIN_PRICE, MAX_PRICE);
            seededTimestamps[i] = uint40(block.timestamp);
        }

        uint256 issuerAuthorizedForSeed = issuerSharesAuthorized > totalSharesIssued ? issuerSharesAuthorized : totalSharesIssued;
        InitialShares memory initialShares = InitialShares({
            issuerInitialShares: IssuerInitialShares({
                shares_authorized: issuerAuthorizedForSeed,
                shares_issued: totalSharesIssued
            }),
            stockClassesInitialShares: stockClassInitialShares
        });

        vm.startPrank(admin);
        capTable.mintSharesAuthorized(initialShares);
        capTable.mintActivePositions(
            seededStakeholderIds,
            seededSecurityIds,
            seededStockClassIds,
            seededQuantities,
            seededSharePrices,
            seededTimestamps
        );
        vm.stopPrank();

        // Seed writes positions without transactions, so ingest the IDs we just minted.
        for (uint256 i = 0; i < stockClassCount; i++) {
            lots.push(
                LiveLot({
                    stakeholderId: seededStakeholderIds[i],
                    stockClassId: seededStockClassIds[i],
                    securityId: seededSecurityIds[i]
                })
            );
        }
    }

    function transferStock(
        uint256 transferorIndex,
        uint256 transfereeIndex,
        uint256 stockClassIndex,
        uint256 quantitySeed,
        uint256 priceSeed
    ) external {
        if (stakeholderIds.length == 0 || stockClassIds.length == 0) return;

        bytes16 transferorId = stakeholderIds[transferorIndex % stakeholderIds.length];
        bytes16 transfereeId = stakeholderIds[transfereeIndex % stakeholderIds.length];
        bytes16 stockClassId = stockClassIds[stockClassIndex % stockClassIds.length];

        (, uint256 available, ) = capTable.getAveragePosition(transferorId, stockClassId);
        if (available == 0) return;

        StockTransferParams memory params = StockTransferParams({
            transferor_stakeholder_id: transferorId,
            transferee_stakeholder_id: transfereeId,
            stock_class_id: stockClassId,
            is_buyer_verified: true,
            quantity: bound(quantitySeed, 1, available),
            share_price: bound(priceSeed, MIN_PRICE, MAX_PRICE),
            nonce: 0,
            custom_id: ""
        });

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.transferStock(params) {
            _syncLots(txBefore);
        } catch {}
    }

    function repurchaseStock(uint256 lotIndex, uint256 quantitySeed, uint256 priceSeed) external {
        LiveLot memory lot = _liveLot(lotIndex);
        if (lot.securityId == bytes16(0)) return;

        (, uint256 quantity, , ) = capTable.getActivePosition(lot.stakeholderId, lot.securityId);
        if (quantity == 0) {
            _pruneDeadLots();
            return;
        }

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.repurchaseStock(_stockParams(lot), bound(quantitySeed, 1, quantity), bound(priceSeed, MIN_PRICE, MAX_PRICE)) {
            _syncLots(txBefore);
        } catch {}
    }

    function cancelStock(uint256 lotIndex, uint256 quantitySeed) external {
        LiveLot memory lot = _liveLot(lotIndex);
        if (lot.securityId == bytes16(0)) return;

        (, uint256 quantity, , ) = capTable.getActivePosition(lot.stakeholderId, lot.securityId);
        if (quantity == 0) {
            _pruneDeadLots();
            return;
        }

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.cancelStock(_stockParams(lot), bound(quantitySeed, 1, quantity)) {
            _syncLots(txBefore);
        } catch {}
    }

    function retractStockIssuance(uint256 lotIndex) external {
        LiveLot memory lot = _liveLot(lotIndex);
        if (lot.securityId == bytes16(0)) return;

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.retractStockIssuance(_stockParams(lot)) {
            _syncLots(txBefore);
        } catch {}
    }

    function reissueStock(uint256 lotIndex) external {
        LiveLot memory lot = _liveLot(lotIndex);
        if (lot.securityId == bytes16(0)) return;

        bytes16 resultingSecurityId = _replacementLot(lot);
        if (resultingSecurityId == bytes16(0)) return;

        bytes16[] memory resultingSecurityIds = new bytes16[](1);
        resultingSecurityIds[0] = resultingSecurityId;

        uint256 txBefore = capTable.getTransactionsCount();
        vm.prank(admin);
        try capTable.reissueStock(_stockParams(lot), resultingSecurityIds) {
            _syncLots(txBefore);
        } catch {}
    }

    function adjustIssuerAuthorizedShares(uint256 newSharesSeed) external {
        (, , uint256 sharesIssued, ) = capTable.issuer();

        uint256 maxStockClassAuthorized = 0;
        for (uint256 i = 0; i < stockClassIds.length; i++) {
            (, , , , uint256 classAuthorized) = capTable.getStockClassById(stockClassIds[i]);
            if (classAuthorized > maxStockClassAuthorized) {
                maxStockClassAuthorized = classAuthorized;
            }
        }

        uint256 minShares = sharesIssued > maxStockClassAuthorized ? sharesIssued : maxStockClassAuthorized;
        if (minShares == 0) minShares = 1;

        uint256 newAuthorized = bound(newSharesSeed, minShares, MAX_SHARES);

        string[] memory comments = new string[](0);

        vm.prank(admin);
        try capTable.adjustIssuerAuthorizedShares(newAuthorized, comments, "", "") {} catch {}
    }

    function adjustStockClassAuthorizedShares(uint256 stockClassIndex, uint256 newSharesSeed) external {
        if (stockClassIds.length == 0) return;

        uint256 scIdx = stockClassIndex % stockClassIds.length;
        bytes16 stockClassId = stockClassIds[scIdx];

        (, , , uint256 sharesIssued, ) = capTable.getStockClassById(stockClassId);
        (, , , uint256 issuerAuthorized) = capTable.issuer();

        uint256 minShares = sharesIssued > 0 ? sharesIssued : 1;
        uint256 maxShares = issuerAuthorized > minShares ? issuerAuthorized : minShares;
        uint256 newAuthorized = bound(newSharesSeed, minShares, maxShares);

        string[] memory comments = new string[](0);

        vm.prank(admin);
        try capTable.adjustStockClassAuthorizedShares(stockClassId, newAuthorized, comments, "", "") {} catch {}
    }

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

    function _liveLot(uint256 lotIndex) private view returns (LiveLot memory) {
        if (lots.length == 0) return LiveLot(bytes16(0), bytes16(0), bytes16(0));
        return lots[lotIndex % lots.length];
    }

    function _stockParams(LiveLot memory lot) private pure returns (StockParams memory) {
        return
            StockParams({
                stakeholder_id: lot.stakeholderId,
                stock_class_id: lot.stockClassId,
                security_id: lot.securityId,
                comments: new string[](0),
                reason_text: ""
            });
    }

    function _replacementLot(LiveLot memory retired) private view returns (bytes16) {
        for (uint256 i = 0; i < lots.length; i++) {
            if (
                lots[i].securityId != retired.securityId &&
                lots[i].stakeholderId == retired.stakeholderId &&
                lots[i].stockClassId == retired.stockClassId
            ) {
                (, uint256 quantity, , ) = capTable.getActivePosition(lots[i].stakeholderId, lots[i].securityId);
                if (quantity > 0) return lots[i].securityId;
            }
        }
        return bytes16(0);
    }

    function _syncLots(uint256 fromTxIndex) private {
        _pruneDeadLots();
        _ingestNewIssuances(fromTxIndex);
    }

    function _pruneDeadLots() private {
        uint256 i = 0;
        while (i < lots.length) {
            (, uint256 quantity, , ) = capTable.getActivePosition(lots[i].stakeholderId, lots[i].securityId);
            if (quantity == 0) {
                lots[i] = lots[lots.length - 1];
                lots.pop();
            } else {
                i++;
            }
        }
    }

    function _ingestNewIssuances(uint256 fromTxIndex) private {
        uint256 txCount = capTable.getTransactionsCount();
        for (uint256 i = fromTxIndex; i < txCount; i++) {
            try issuanceDecoder.decode(capTable.transactions(i)) returns (StockIssuance memory issuance) {
                if (keccak256(bytes(issuance.object_type)) != ISSUANCE_OBJECT_TYPE) continue;
                lots.push(
                    LiveLot({
                        stakeholderId: issuance.params.stakeholder_id,
                        stockClassId: issuance.params.stock_class_id,
                        securityId: issuance.security_id
                    })
                );
            } catch {}
        }
    }
}

/// @dev Isolated so a non-issuance `transactions` entry cannot revert the handler.
contract CapTableIssuanceDecoder {
    function decode(bytes memory data) external pure returns (StockIssuance memory) {
        return abi.decode(data, (StockIssuance));
    }
}
