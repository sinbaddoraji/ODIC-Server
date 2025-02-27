import { Db, MongoClient } from "mongodb";

class Database {
    private client: MongoClient | null = null;

    async connect(): Promise<void> {
        if (!this.client) {
            try {
                const connectionString = process.env.DB_CONN_STRING;
                if (!connectionString) {
                    throw new Error("Database connection string is not defined.");
                }
                this.client = new MongoClient(connectionString);
                await this.client.connect();
                console.log("Successfully connected to the database.");
            } catch (error) {
                console.error("Failed to connect to the database.", error);
                throw error;
            }
        }
    }

     getDb(): Db {
        return this.client.db("odic");
    }
}

export default new Database();