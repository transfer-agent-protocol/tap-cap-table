pragma solidity ^0.8.19;

contract StockTransferTX {
    // @dev are unique identifiers in solidity are bytes32?
    // date fields are going to use block timestamp
    struct StockTransfer {
        string id;
        string object_type;
        string quantity;
        string[] comments; // optional
        string security_id;
        string consideration_text; // optional
        string balance_security_id; // optional
        string[] resulting_security_ids;
    }

    StockTransfer public stockTransfer;

    event StockTransferCreated(
        string id,
        string indexed object_type,
        string quantity,
        string[] comments,
        string indexed security_id,
        string consideration_text,
        string balance_security_id,
        string[] resulting_security_ids
    );

   constructor(
        string memory id,        
        string memory object_type,
        string memory quantity,
        string[] memory comments,
        string memory security_id,
        string memory consideration_text,
        string memory balance_security_id,
        string[] memory resulting_security_ids
    ) {
        stockTransfer = StockTransfer(
            id,
            object_type,
            quantity,
            comments,
            security_id,
            consideration_text,
            balance_security_id,
            resulting_security_ids
        );

        emit StockTransferCreated(
            id,
            object_type,
            quantity,
            comments,
            security_id,
            consideration_text,
            balance_security_id,
            resulting_security_ids);
    }
}
