import axios from "axios";
import { shutdownServer, startServer } from "../../app";
import { connectDB } from "../../db/config/mongoose";
import { issuer } from "../../scripts/sampleData";


let _server = null

const deleteAllCollections = async () => {
    const dbConn = await connectDB();
    console.log("Dropping mongo database: ", dbConn.name);
    await dbConn.dropDatabase();
}

beforeAll(async () => {
    await deleteAllCollections();
    console.log("starting server");
    _server = await startServer();
});

afterAll(async () => {
    console.log("shuting down server");
    await shutdownServer(_server);
});

test('end to end with event processing', async () => {
    // TODO: talk to Victor to get a good set of example data going
    //  ??
    // Deploy a cap table and seed the database
    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", issuer);
    
    // TODO: check that mongo has the appropriate updates
    // 
});
