pragma solidity ^0.8.19;

contract StockIssuanceTX {
    // @dev are unique identifiers in solidity are bytes32?
    // date fields are going to use block timestamp
    struct StockIssuance {
        string id;
        string object_type;
        string stock_class_id; 
        string stock_plan_id; // Optional
        string share_price; // OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
        string quantity; // Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
        string vesting_terms_id; // Optional
        string cost_basis; // OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
        string[] stock_legend_ids; // Optional
        string issuance_type; // Optional for special types (["RSA", "FOUNDERS_STOCK"],)
        string[] comments; // Optional
        string security_id; 
        string stakeholder_id; 
        string board_approval_date; // Optional
        string stockholder_approval_date; // Optional
        string consideration_text; // Optional
        string[] security_law_exemptions; // Unclear 
    }

    StockIssuance public stockIssuance;

    event StockIssuanceCreated(
        string id,
        string indexed object_type,
        string stock_class_id,
        string stock_plan_id,
        string share_price,
        string quantity,
        string vesting_terms_id,
        string cost_basis,
        string[] stock_legend_ids,
        string issuance_type,
        string[] comments,
        string indexed security_id,
        string indexed stakeholder_id,
        string board_approval_date,
        string stockholder_approval_date,
        string consideration_text,
        string[] security_law_exemptions
    );

   constructor(
        string memory id,
        string memory object_type,
        string memory stock_class_id,
        string memory stock_plan_id,
        string memory share_price,
        string memory quantity,
        string memory vesting_terms_id,
        string memory cost_basis,
        string[] memory stock_legend_ids,
        string memory issuance_type,
        string[] memory comments,
        string memory security_id,
        string memory stakeholder_id,
        string memory board_approval_date,
        string memory stockholder_approval_date,
        string memory consideration_text,
        string[] memory security_law_exemptions
    ) {
        stockIssuance = StockIssuance(
            id,
            object_type,
            stock_class_id,
            stock_plan_id,
            share_price,
            quantity,
            vesting_terms_id,
            cost_basis,
            stock_legend_ids,
            issuance_type,
            comments,
            security_id,
            stakeholder_id,
            board_approval_date,
            stockholder_approval_date,
            consideration_text,
            security_law_exemptions
        );

        emit StockIssuanceCreated(
            id,
            object_type,
            stock_class_id,
            stock_plan_id,
            share_price,
            quantity,
            vesting_terms_id,
            cost_basis,
            stock_legend_ids,
            issuance_type,
            comments,
            security_id,
            stakeholder_id,
            board_approval_date,
            stockholder_approval_date,
            consideration_text,
            security_law_exemptions);
    }
}
