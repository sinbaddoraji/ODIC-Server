import { ObjectId } from "mongodb";

export interface Client {
    _id: ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}