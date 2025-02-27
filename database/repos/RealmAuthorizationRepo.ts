import { ObjectId, Collection, UpdateResult } from "mongodb";
import dotenv from "dotenv";
import Database from "../database";
import UserManagementRepo from "./UserManagementRepo";
import { User } from "../../models/Authentication/User";


dotenv.config(); // Ensure environment variables are loaded

class RealmAuthorizationRepo {
    private realmAuthInfoCollection: Collection<RealmAuthorizationInformation>;
    private readonly REALM_AUTH_COLLECTION: string = "realmAuthInfo"; // Collection name

    constructor() {
        this.initializeDb();
    }

    /**
     * Initializes the realm authorization information collection and sets up indexes.
     */
    private async initializeDb() {
        try {
            await Database.connect(); // Connect to the database
            const db = Database.getDb();
            this.realmAuthInfoCollection = db.collection<RealmAuthorizationInformation>(this.REALM_AUTH_COLLECTION);

        } catch (error) {
            console.error("Error initializing RealmAuthorizationInfo collection:", error);
            throw error; // Propagate the error after logging
        }
    }

    /**
     * Registers a user to a specific realm.
     * @param realm_id The ID of the realm.
     * @param user_id The ID of the user to register.
     * @returns True if the operation was successful, otherwise false.
     */
    async RegisterUserToRealm(realm_id: string, user_id: string): Promise<boolean> {
        try {
            // Validate Input
            if (!ObjectId.isValid(realm_id)) {
                console.error("Invalid realm ID format.");
                return false;
            }

            if (!ObjectId.isValid(user_id)) {
                console.error("Invalid user ID format.");
                return false;
            }

            const filter = { realm_id: realm_id };
            const update = { $addToSet: { users: user_id } };
            const options = { upsert: true };

            const result: UpdateResult = await this.realmAuthInfoCollection.updateOne(filter, update, options);

            // result.upsertedCount indicates if a new document was created
            // result.modifiedCount indicates if an existing document was modified
            if (result.upsertedCount > 0 || result.modifiedCount > 0) {
                console.log(`User ${user_id} registered to realm ${realm_id} successfully.`);
                return true;
            }

            console.warn(`User ${user_id} was already registered to realm ${realm_id}.`);
            return false;
        } catch (error) {
            console.error("Error registering user to realm:", error);
            return false;
        }
    }

    /**
     * Retrieves all user IDs associated with a specific realm.
     * @param realm_id The ID of the realm.
     * @returns An array of user IDs if the realm exists, otherwise an empty array.
     */
    async GetRealmUsers(realm_id: string): Promise<User[]> {
        try {
            
            if (!ObjectId.isValid(realm_id)) {
                console.error("Invalid realm ID format.");
                return [];
            }

            const realmAuthInfo = await this.realmAuthInfoCollection.findOne({ realm_id: realm_id });

            if (realmAuthInfo) 
            {
                let users = realmAuthInfo.user_ids;


                return  await Promise.all(
                    realmAuthInfo.user_ids.map(async (userId) => {
                      return await UserManagementRepo.GetUserById(userId);
                    })
                  );
            }

            console.warn(`Realm ${realm_id} not found.`);
            return

        } catch (error) {
            console.error("Error fetching realm users:", error);
            return [];
        }
    }

    /**
     * Removes a user from a specific realm.
     * @param realm_id The ID of the realm.
     * @param user_id The ID of the user to remove.
     * @returns True if the operation was successful, otherwise false.
     */
    async RemoveUserFromRealm(realm_id: string, user_id: string): Promise<boolean> {
        try {
            // Validate Input
            if (!ObjectId.isValid(realm_id)) {
                console.error("Invalid realm ID format.");
                return false;
            }

            if (!ObjectId.isValid(user_id)) {
                console.error("Invalid user ID format.");
                return false;
            }

            const filter = { realm_id: realm_id };
            const update = { $pull: { users: user_id } };

            const result: UpdateResult = await this.realmAuthInfoCollection.updateOne(filter, update);

            if (result.modifiedCount === 1) {
                console.log(`User ${user_id} removed from realm ${realm_id} successfully.`);
                return true;
            }

            console.warn(`User ${user_id} was not found in realm ${realm_id}.`);
            return false;
        } catch (error) {
            console.error("Error removing user from realm:", error);
            return false;
        }
    }


    async AssignRoleToUser(realm_id: string, user_id: string, role: string): Promise<boolean> {
        try {
            // Implementation for assigning a role to a user within a realm
        } catch (error) {
            console.error("Error assigning role to user:", error);
            return false;
        }
    }

    async GetUserRoles(realm_id: string, user_id: string): Promise<string[]> {
        try {
            // Implementation for retrieving roles of a user within a realm
        } catch (error) {
            console.error("Error fetching user roles:", error);
            return [];
        }
    }
    
}

export default new RealmAuthorizationRepo();