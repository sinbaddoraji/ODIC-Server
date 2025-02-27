import { ObjectId, Collection, InsertOneResult, DeleteResult, UpdateResult } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Database from "../database";
import { User } from "../../models/Authentication/User";
import { RegisterUserDTO } from "../../dto/registerUserDto";
// Ensure environment variables are loaded
dotenv.config();


class UserManagementRepo {
    private usersCollection: Collection<User>;
    private readonly SALT_ROUNDS: number = 10; // Number of salt rounds for bcrypt

    constructor() {
        this.initializeDb();
    }

    // Initialize the users collection
    private async initializeDb() {
         await Database.connect(); // Connect to the database
        const db = Database.getDb();
        this.usersCollection = db.collection<User>("users");
    }

    /**
     * Registers a new user by hashing their password and storing their information.
     * @param userData The registration data including email, password, and name.
     * @returns True if registration is successful, otherwise false.
     */
    async RegisterUser(userData: RegisterUserDTO): Promise<User> {
        try {
            // Check if the email is already in use
            const existingUser = await this.GetUserByEmail(userData.email);
            if (existingUser) {
                console.error("Registration failed: Email already in use.");
                return null;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

            // Create the user object
            const newUser: User = {
                user_email: userData.email,
                user_password_hash: hashedPassword,
                user_name: userData.name,
                user_created_at: new Date(),
                user_updated_at: new Date(),
                user_id: new ObjectId()
            };

            // Insert the user into the database
            const result: InsertOneResult<User> = await this.usersCollection.insertOne(newUser);
            
            return newUser;
        } catch (error) {
            console.error("Error registering user:", error);
            return null;
        }
    }

    /**
     * Creates a new user in the database.
     * Note: This method assumes that the password is already hashed.
     * @param user The user object to create.
     * @returns True if the user was successfully created, otherwise false.
     */
    async CreateUser(user: User): Promise<boolean> {
        try {
            const result: InsertOneResult<User> = await this.usersCollection.insertOne(user);
            return result.acknowledged && result.insertedId !== undefined;
        } catch (error) {
            console.error("Error creating user:", error);
            return false;
        }
    }

    /**
     * Retrieves a user by their email.
     * @param user_email The email of the user to retrieve.
     * @returns The user object if found, otherwise null.
     */
    async GetUserByEmail(user_email: string): Promise<User | null> {
        try {
            const user = await this.usersCollection.findOne({ user_email: user_email });
            return user;
        } catch (error) {
            console.error("Error fetching user by email:", error);
            return null;
        }
    }

    /**
     * Retrieves a user by their ID.
     * @param user_id The ID of the user to retrieve.
     * @returns The user object if found, otherwise null.
     */
    async GetUserById(user_id: string): Promise<User | null> {
        try {
            const objectId = new ObjectId(user_id);
            const user = await this.usersCollection.findOne({ _id: objectId });
            return user;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            return null;
        }
    }

    /**
     * Deletes a user by their ID.
     * @param user_id The ID of the user to delete.
     * @returns True if the user was successfully deleted, otherwise false.
     */
    async DeleteUser(user_id: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(user_id);
            const result: DeleteResult = await this.usersCollection.deleteOne({ _id: objectId });
            return result.deletedCount === 1;
        } catch (error) {
            console.error("Error deleting user:", error);
            return false;
        }
    }
}

export default new UserManagementRepo();