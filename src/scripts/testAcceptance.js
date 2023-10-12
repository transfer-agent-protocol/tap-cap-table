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
    console.log("⏳ | Creating stock acceptance…");
    const stockAcceptanceResp = await axios.post(
        "http://localhost:8080/transactions/accept/stock",
        stockAccept(
            "11a17b3d-03d6-4d12-a0b8-c9130a907a8c", // Issuer ID
            "c88795f2-9451-4bf5-b4a6-551fe1a27605", // Stakeholder ID
            "70388f9f-a707-47dd-b8db-67d61e85e6e6", // StockClass ID
            "0b43afa4-b613-d945-1929-3a4315bdb132", // Security ID
            ["acceptance"]
        )
    );

    console.log("✅ | Stock acceptance response", stockAcceptanceResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
