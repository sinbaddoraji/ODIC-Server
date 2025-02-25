import { ObjectId } from "mongodb";

export interface Realm
{
    id: ObjectId;
    name: string;
}