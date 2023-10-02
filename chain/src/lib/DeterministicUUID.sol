// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library DeterministicUUID {
    function generateDeterministicUniqueID(bytes16 id, uint256 nonce) public view returns (bytes16) {
        bytes16 deterministicValue = bytes16(keccak256(abi.encodePacked(id, block.timestamp, block.prevrandao, nonce)));
        return deterministicValue;
    }
}
