import { ObjectId } from "mongodb";
import { Realm } from "../../models/realms/realm";
import { collections } from "../mongo";

interface IRealmManagementRepo {
    createRealm(realm: Realm): Promise<boolean>;
    getRealms(): Promise<Realm[]>;
    getRealmById(realmId: string): Promise<Realm>;
    deleteRealm(realmId: string): Promise<boolean>;
}

class RealmManagementRepo implements IRealmManagementRepo {
    async createRealm(realm: Realm): Promise<boolean> 
    {
        // Create a new realm
        realm.id = new ObjectId();
        let result = await collections.realms?.insertOne(realm);

        return result.acknowledged;
    }

    async getRealms(): Promise<Realm[]> {
        // Get all realms
        const realms = await collections.realms?.find({}).toArray();
        return realms.map(realm => ({
            realm_id: realm.realm_id
        })) as Realm[];
    }

    async getRealmById(realmId: string): Promise<Realm> {
        // Get a realm by ID
        const realm = await collections.realms?.find({ realm_id: realmId })[0];
        return realm;
    }

    async deleteRealm(realmId: string): Promise<boolean> {
       // Delete a realm by ID
       let result = await collections.realms?.deleteOne({ realm_id: realmId });
       return result.acknowledged;
    }
}

export default new RealmManagementRepo();