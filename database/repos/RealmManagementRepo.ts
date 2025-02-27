import { ObjectId, MongoClient, Db, Collection } from "mongodb";
import { Realm } from "../../models/realms/realm";
import dotenv from "dotenv";
import Database from "../database";
import UserManagementRepo from "./UserManagementRepo";

class RealmManagementRepo {
    private realmsCollection: Collection<Realm>;

    constructor() {
        dotenv.config();
        this.initializeDb();
    }

   async initializeDb() {
     await Database.connect(); // Connect to the database
        this.realmsCollection = Database.getDb().collection<Realm>("realms");
    }

    async createRealm(realm: Realm): Promise<boolean> {
        try {
            realm.id = new ObjectId();
            const result = await this.realmsCollection.insertOne(realm);
            return result.acknowledged;
        } catch (error) {
            console.error("Error creating realm:", error);
            return false;
        }
    }

    async getRealms(): Promise<Realm[]> {
        try {
            const realms = await this.realmsCollection.find({}).toArray();
            return realms;
        } catch (error) {
            console.error("Error fetching realms:", error);
            return [];
        }
    }

    async getRealmById(realmId: string): Promise<Realm> {
        try {
            // Fid the realm by name

            const realm = await this.realmsCollection.findOne({ name: realmId });
            return realm;
        } catch (error) {
            console.error("Error fetching realm by ID:", error);
            return null;
        }
    }

    async deleteRealm(realmId: string): Promise<boolean> {
        try {
            const result = await this.realmsCollection.deleteOne({ _id: new ObjectId(realmId) });
            UserManagementRepo.DeleteUser(realmId);

            return result.acknowledged;
        } catch (error) {
            console.error("Error deleting realm:", error);
            return false;
        }
    }
}

export default new RealmManagementRepo();