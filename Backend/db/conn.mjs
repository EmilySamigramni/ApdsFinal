import {MongoClient} from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.ATLAS_CON_STRING || "";
console.log(connectionString);


const client = new MongoClient(connectionString);

let conn;
let db;

async function connectToDB() {
    try{
        conn = await client.connect();
        console.log('mongoDb is connected')
        db = client.db("APDS");
    }catch(e) {
        console.error(e);
    }   
}

await connectToDB()

export default db;