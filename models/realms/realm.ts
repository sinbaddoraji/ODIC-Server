import { ObjectId } from "mongodb";

export interface Realm
{
    id: ObjectId;
    realm_id: string;
}