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
    console.log("..creating stock cancel");
    const stockReissueResp  = await axios.post(
        "http://localhost:8080/transactions/reissue/stock",
        stockReissue(
            "fc7bc306-a960-47bb-a02a-ee28d571de2d", // Issuer ID
            "0490b6c9-56d0-4452-8eac-dd75a7191792", // Stakeholder ID
            "2db38fc4-5d42-44f6-8b22-0d44ae13e1af", // StockClass ID
            "4b9fcfe7-d4f5-b103-7151-1a118c4fd201", // Security ID
            ["538be748-45f4-4e6e-9741-b75f19233053", "86917a6a-a97f-44f7-8252-262dd7e038c7"],
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
