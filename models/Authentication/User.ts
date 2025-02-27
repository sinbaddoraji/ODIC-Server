import { ObjectId } from "mongodb";

export interface User{
    user_name: string;
    user_id: ObjectId;
    user_email: string;
    user_password_hash: string;
    basic_user_secret: string;
    user_created_at: Date;
    user_updated_at: Date;
}