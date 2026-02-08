// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.30;

interface ICapTableFactory {
    event CapTableCreated(address indexed capTableProxy);
    event CapTableImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    function createCapTable(bytes16 id, string memory name, uint256 initial_shares_authorized, address operator) external returns (address);

    function updateCapTableImplementation(address newImplementation) external;

    function getCapTableCount() external view returns (uint256);
}
