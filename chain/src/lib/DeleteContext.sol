// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { ActivePositions, SecIdsStockClass } from "./Structs.sol";

library DeleteContext {
    function deleteActivePosition(bytes16 _stakeholder_id, bytes16 _security_id, ActivePositions storage positions) external {
        delete positions.activePositions[_stakeholder_id][_security_id];
    }

    function deleteActiveSecurityIdsByStockClass(
        bytes16 _stakeholder_id,
        bytes16 _stock_class_id,
        bytes16 _security_id,
        SecIdsStockClass storage activeSecs
    ) external {
        bytes16[] storage securities = activeSecs.activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];

        uint256 index = find(securities, _security_id);
        if (index != type(uint256).max) {
            remove(securities, index);
        }
    }

    function find(bytes16[] storage array, bytes16 element) internal view returns (uint256) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return type(uint256).max;
    }

    /// @dev Shifts left so remaining ids stay in issuance order.
    function remove(bytes16[] storage array, uint256 index) internal {
        require(index < array.length, "Index out of bounds");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}
