import { ObjectId, Collection, UpdateResult } from "mongodb";
import Database from "../database";
import dotenv from "dotenv";
import { Client } from "../../models/clients/Client";

dotenv.config();

export class ClientManagementRepo {
    private readonly Client_Management_COLLECTION: string = "client";
    private realmAuthInfoCollection: Collection<Client>;

    constructor() {
        this.initializeDb();
    }

    /**
     * Initializes the database connection and sets up the collection
     */
    private async initializeDb(): Promise<void> {
        try {
            await Database.connect();
            const db = Database.getDb();
            this.realmAuthInfoCollection = db.collection<Client>(this.Client_Management_COLLECTION);
        } catch (error) {
            console.error("Error initializing ClientManagementRepo:", error);
            throw new Error("Failed to initialize database connection");
        }
    }

    /**
     * Retrieves all clients from the database
     */
    public async getAllClients(): Promise<Client[]> {
        try {
            const clients = await this.realmAuthInfoCollection.find().toArray();
            return clients;
        } catch (error) {
            console.error("Error fetching all clients:", error);
            throw new Error("Failed to retrieve clients");
        }
    }

    public async getClientsForRealm(realmId: string): Promise<Client[] | null> {
        try {
            const clients = this.realmAuthInfoCollection.find({ realm_id: realmId });
            return clients.toArray();
        } catch (error) {
            console.error("Error fetching client for realm:", error);
            throw new Error("Failed to retrieve client");
        }
    }

    /**
     * Retrieves a single client by its ID
     * @param clientId The ID of the client to retrieve
     */
    public async getClient(clientId: string): Promise<Client | null> {
        try {
            const client = await this.realmAuthInfoCollection.findOne({ name: clientId });
            return client;
        } catch (error) {
            console.error("Error fetching client with ID:", clientId, ":", error);
            throw new Error("Failed to retrieve client");
        }
    }

    /**
     * Creates a new client in the database
     * @param client The client object to insert
     */
    public async createClient(client: Omit<Client, "_id" | "createdAt" | "updatedAt">): Promise<Client> {
        try {
            if (await this.clientExists(client.name)) {
                throw new Error("Client with this name already exists");
            }

            const result = await this.realmAuthInfoCollection.insertOne({
                ...client,
                _id: new ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const createdClient = await this.realmAuthInfoCollection.findOne<Client>({ _id: result.insertedId });
            return createdClient;
        } catch (error) {
            console.error("Error creating client:", error);
            throw new Error("Failed to create client");
        }
    }

    /**
     * Updates an existing client in the database
     * @param clientId The ID of the client to update
     * @param updates The fields to update
     */
    public async updateClient(clientId: string, updates: Partial<Client>): Promise<Client | null> {
        try {
            const updateResult = await this.realmAuthInfoCollection.findOneAndUpdate(
                { _id: new ObjectId(clientId) },
                {
                    $set: {
                        ...updates,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return updateResult;
        } catch (error) {
            console.error("Error updating client with ID:", clientId, ":", error);
            throw new Error("Failed to update client");
        }
    }

    /**
     * Deletes a client from the database
     * @param clientId The ID of the client to delete
     */
    public async deleteClient(clientId: string): Promise<void> {
        try {
            const result = await this.realmAuthInfoCollection.deleteOne({ _id: new ObjectId(clientId) });

            if (result.deletedCount === 0) {
                throw new Error("Client not found");
            }
        } catch (error) {
            console.error("Error deleting client with ID:", clientId, ":", error);
            throw new Error("Failed to delete client");
        }
    }

    /**
     * Checks if a client with the given name already exists
     * @param name The name to check
     */
    private async clientExists(name: string): Promise<boolean> {
        try {
            const client = await this.realmAuthInfoCollection.findOne<Client>({ name });
            return client !== null;
        } catch (error) {
            console.error("Error checking if client exists:", error);
            throw new Error("Failed to check client existence");
        }
    }
}

export default new ClientManagementRepo();