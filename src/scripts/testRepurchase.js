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
    const stockReissueResp  = await axios.post(
        "http://localhost:8080/transactions/repurchase/stock",
        stockRepurchase(
            "260a54b7-91d7-4433-897b-f400acd86928", // Issuer ID
            "3000",
            "1.1",
            "c5a9cdac-fa7d-486f-b171-734346d4c05d", // Stakeholder ID
            "be5b6236-a906-47ea-a5fd-c8d2152d5ccf", // StockClass ID
            "b659e8de-d9bc-120d-862e-ada18701c814", // Security ID
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
