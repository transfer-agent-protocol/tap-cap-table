// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICapTableFactory {
    event CapTableCreated(address indexed capTableProxy);

    function createCapTable(bytes16 id, string memory name, uint256 initial_shares_authorized) external returns (address);

    function updateCapTableImplementation(address newImplementation) external;

    function getCapTableCount() external view returns (uint256);
}
