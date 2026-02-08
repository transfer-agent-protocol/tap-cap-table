// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { ActivePositions, SecIdsStockClass } from "./Structs.sol";

library DeleteContext {
    function deleteActivePosition(bytes16 _stakeholder_id, bytes16 _security_id, ActivePositions storage positions) external {
        delete positions.activePositions[_stakeholder_id][_security_id];
    }

    // Active Security IDs by Stock Class { "stakeholder_id": { "stock_class_id-1": ["sec-id-1", "sec-id-2"] } }
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

    /**
     * @dev Searches for an element in a bytes16 array and returns its index.
     * Returns uint256(-1) if the element is not found.
     * @param array The array to search in.
     * @param element The element to search for.
     */
    function find(bytes16[] storage array, bytes16 element) internal view returns (uint256) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return type(uint256).max; // Return the maximum value of uint256 to indicate "not found"
    }

    /**
     * @dev Removes an element at a specific index in a bytes16 array.
     * Shifts all subsequent elements one position to the left and reduces the array length.
     * @param array The array to modify.
     * @param index The index of the element to remove.
     */
    function remove(bytes16[] storage array, uint256 index) internal {
        require(index < array.length, "Index out of bounds");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}
