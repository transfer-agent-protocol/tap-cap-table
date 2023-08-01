pragma solidity ^0.8.3;

contract StockIssuanceTX {
    struct StockIssuance {
        string id;
        string object_type;
        string stock_class_id;
        int share_price;
        uint256 quantity;
        string security_id;
        string stakeholder_id;
    }

    StockIssuance public stockIssuance;

    event StockIssuanceCreated(
        string id,
        string indexed stakeholder_id,
        string indexed security_id,
        string indexed object_type,
        string stock_class_id,
        uint256 quantity
    );

   constructor(
        string memory _id,
        string memory _object_type,
        string memory _stock_class_id,
        int  _share_price,
        uint256 _quantity,
        string memory _security_id,
        string memory _stakeholder_id
    ) {
        stockIssuance = StockIssuance(
            _id,
            _object_type,
            _stock_class_id,
            _share_price,
            _quantity,
            _security_id,
            _stakeholder_id
        );

        emit StockIssuanceCreated(_id, _stakeholder_id, _security_id, _object_type, _stock_class_id, _quantity);
    }
}
