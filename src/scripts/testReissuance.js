import {stockRetract} from "./sampleData.js";
import axios from "axios";


const main = async () => {
    /*
        *  _id: '9e899a76-78df-4930-41da-ed9f4e3791b8',
  __v: 0,
  board_approval_date: '',
  comments: [],
  consideration_text: '',
  cost_basis: { amount: '0', currency: 'USD' },
  custom_id: '',
  date: '2023-10-03',
  is_onchain_synced: true,
  issuance_type: '',
  issuer: 'd1d05c07-fa9a-4229-97fa-41193952aee5',
  object_type: 'TX_STOCK_ISSUANCE',
  quantity: '3000',
  security_id: 'f9c12fb0-b929-82b1-de61-a43c8a7ea06b',
  stakeholder_id: '0b63ea27-c3c8-4bc6-8b5a-af7e11697e6c',
  stock_class_id: '0ba7c79a-6380-4142-8224-79bb99207b74',
}

        */
    console.log("..creating stock cancel");
    const stockRetraction = await axios.post(
        "http://localhost:8080/transactions/reissue/stock",
        stockRetract(
            "", // Issuer ID
            "", // Stakeholder ID
            "", // StockClass ID
            "", // Security ID
            ""
        )
    );

    console.log("stockRetractionResponse", stockRetraction .data);

};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
