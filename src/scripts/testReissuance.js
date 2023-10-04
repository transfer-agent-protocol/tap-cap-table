import { stockReissue } from "./sampleData.js";
import axios from "axios";

const main = async () => {
    /*
     *   _id: 'd585d4fa-a1a8-e09f-87f5-df97dfa79d87',
  __v: 0,
  issuer: 'fc7bc306-a960-47bb-a02a-ee28d571de2d',
  security_id: '4b9fcfe7-d4f5-b103-7151-1a118c4fd201',
  stakeholder_id: '0490b6c9-56d0-4452-8eac-dd75a7191792',
  stock_class_id: '2db38fc4-5d42-44f6-8b22-0d44ae13e1af',
}


        */
    console.log("..creating stock reissuance");
    const stockReissueResp = await axios.post(
        "http://localhost:8080/transactions/reissue/stock",
        stockReissue(
            "ba3b7f7b-f7aa-4d8c-847d-8a2b0cab6afe", // Issuer ID
            "1b9750e9-5ec9-421d-9912-3f07503b2bf6", // Stakeholder ID
            "e8eaad40-65f7-4b33-9860-8d98e2dd5771", // StockClass ID
            "767cb4ec-5eb1-6488-218b-a57b178abf68", // Security ID
            ["2b14be59-2f4c-5bf7-ce44-b315f68c2088"], // Resulting Security IDs
            "reissue"
        )
    );

    console.log("stockReissueResponse", stockReissueResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
