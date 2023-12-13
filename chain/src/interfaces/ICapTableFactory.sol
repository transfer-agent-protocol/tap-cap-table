// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICapTableFactory {
    event CapTableCreated(address indexed capTableProxy);

    function createCapTable(bytes memory initializationData) external returns (address);

    function updateCapTableImplementation(address newImplementation) external;

    function getCapTableCount() external view returns (uint256);
}
