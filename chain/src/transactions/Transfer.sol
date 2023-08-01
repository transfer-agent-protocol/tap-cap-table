pragma solidity ^0.8.3;

// enum {
//     TX_CONVERTIBLE_TRANSFER
// }
// so on.

contract StockTransferTX {
    struct StockTransfer {
        string id;
        string object_type;
        uint256 quantity;
        string security_id;
        string balance_security_id;
        string[] resulting_security_ids;
    }

    StockTransfer public stockTransfer;

    event StockTransferCreated(
        string indexed id,
        string indexed security_id,
        string indexed object_type,
        uint256  quantity,
        string balance_security_id,
        string[] resulting_security_ids
    );

   constructor(
        string memory _id,
        string memory _object_type,
        uint256 _quantity,
        string memory _security_id,
        string memory _balance_security_id,
        string[] memory _resulting_security_ids
    ) {
        stockTransfer = StockTransfer(
            _id,
            _object_type,
            _quantity,
            _security_id,
            _balance_security_id,
            _resulting_security_ids
        );

        emit StockTransferCreated(_id, _security_id, _object_type, _quantity, _balance_security_id, _resulting_security_ids);

    }
}
