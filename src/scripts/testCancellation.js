import { issuer, stakeholder1, stakeholder2, stockCancel, stockClass, stockIssuance, stockTransfer } from "./sampleData.js";
import axios from "axios";

/*
 custom_id: '',
  date: '2023-10-02',
  is_onchain_synced: true,
  issuance_type: '',
  issuer: '19392ee6-2cf4-48ce-95d5-2d560d66578a',
  object_type: 'TX_STOCK_ISSUANCE',
  quantity: '3000',
  security_id: '69c89411-4eee-1ddd-c6f9-fabf42c5968f',
  security_law_exemptions: [],
  share_numbers_issued: [ { starting_share_number: '0', ending_share_number: '0' } ],
  share_price: { amount: '1.2', currency: 'USD' },
  stakeholder_id: 'fc24728e-1125-4e32-9716-43f8f73b6fc4',
  stock_class_id: '91df2620-9dcc-45b3-8d7e-9bb0f477951f',
  stock_legend_ids: [],
  stock_plan_id: '00000000-0000-0000-0000-000000000000',
  stockholder_approval_date: '',
  vesting_terms_id: '00000000-0000-0000-0000-000000000000'
*/

const main = async () => {
    console.log("..creating stock cancel");
    const stockCancellation = await axios.post(
        "http://localhost:8080/transactions/cancel/stock",
        stockCancel(
            "11a17b3d-03d6-4d12-a0b8-c9130a907a8c", // Issuer ID
            "1000",
            "c88795f2-9451-4bf5-b4a6-551fe1a27605", // Stakeholder ID
            "70388f9f-a707-47dd-b8db-67d61e85e6e6", // StockClass ID
            "2b14be59-2f4c-5bf7-ce44-b315f68c2088", // Security ID
            "Diluted"
        )
    );

    console.log("stockCancellationResponse", stockCancellation.data);

    // console.log("..creating stock transfer");
    // // create stockTransfer
    // const stockTransferResponse = await axios.post(
    //     "http://localhost:8080/transactions/transfer/stock",
    //     stockTransfer(
    //         issuerResponse.data.issuer._id,
    //         "1",
    //         stakeholder1Response.data.stakeholder._id,
    //         stakeholder2Response.data.stakeholder._id,
    //         stockClassResponse.data.stockClass._id,
    //         "4.20"
    //     )
    // );

    // console.log("stockTransferResponse", stockTransferResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
