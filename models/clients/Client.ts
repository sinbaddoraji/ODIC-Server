import { ObjectId } from "mongodb";

export interface Client {
    _id: ObjectId;
    name: string;
    realm_id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}