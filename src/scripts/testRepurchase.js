import { stockRepurchase } from "./sampleData.js";
import axios from "axios";

const main = async () => {
    /*
      issuer: 'cfef1646-f45c-4bd4-9c7e-89e7a52ef713',
      security_id: '76a31be5-9f43-9840-c7fb-652647a60878',
      stakeholder_id: '1fadffd9-e247-49cd-b8e5-5365f134fd6b',
      stock_class_id: '5c6a5284-53fd-40a0-ab66-d43942891075',

    */
    console.log("..creating stock repurchase");
    const stockReissueResp = await axios.post(
        "http://localhost:8080/transactions/repurchase/stock",
        stockRepurchase(
            "11a17b3d-03d6-4d12-a0b8-c9130a907a8c", // Issuer ID
            "1000",
            "1.1",
            "c88795f2-9451-4bf5-b4a6-551fe1a27605", // Stakeholder ID
            "70388f9f-a707-47dd-b8db-67d61e85e6e6", // StockClass ID
            "0b43afa4-b613-d945-1929-3a4315bdb132", // Security ID
            ["repurchase"]
        )
    );

    console.log("stockReissueResponse", stockReissueResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
