import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { realms?: mongoDB.Collection } = {}

export async function connectToDatabase () {
    dotenv.config();
 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
            
    await client.connect();
        
    const db: mongoDB.Db = client.db("odic");
   
    const realmsCollection: mongoDB.Collection = db.collection("realms");
 
    collections.realms = realmsCollection;
       
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${realmsCollection.collectionName}`);
 }