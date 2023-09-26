// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Arrays {
    /**
     * @dev Searches for an element in a bytes16 array and returns its index.
     * Returns uint256(-1) if the element is not found.
     * @param array The array to search in.
     * @param element The element to search for.
     */
    function find(bytes16[] storage array, bytes16 element) external view returns (uint256) {
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
    function remove(bytes16[] storage array, uint256 index) external {
        require(index < array.length, "Index out of bounds");

        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}
