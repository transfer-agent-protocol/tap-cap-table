
import { stockAccept } from "./sampleData.js";
import axios from "axios";


const main = async () => {
    /*
{
  "issuer": "260a54b7-91d7-4433-897b-f400acd86928",
  "security_id": "b659e8de-d9bc-120d-862e-ada18701c814",
  "stakeholder_id": "c5a9cdac-fa7d-486f-b171-734346d4c05d",
  "stock_class_id": "be5b6236-a906-47ea-a5fd-c8d2152d5ccf",
}
    */
    console.log("..creating stock accept");
    const stockAcceptanceResp = await axios.post(
        "http://localhost:8080/transactions/accept/stock",
        stockAccept(
            "260a54b7-91d7-4433-897b-f400acd86928", // Issuer ID
            "c5a9cdac-fa7d-486f-b171-734346d4c05d", // Stakeholder ID
            "be5b6236-a906-47ea-a5fd-c8d2152d5ccf", // StockClass ID
            "b659e8de-d9bc-120d-862e-ada18701c814", // Security ID
            ["acceptance"]
        )
    );

    console.log("stockAcceptanceResponse", stockAcceptanceResp.data);

};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
