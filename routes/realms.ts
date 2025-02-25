import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/mongo";
import { Realm } from "../models/realms/realm";

const router = express.Router();

// Create a new realm
export const createRealm = async (req: Request, res: Response) => {
  try {
    const realm = req.body as Realm;

    // Validation: Ensure required fields are present
    if (!realm.name) {
      return res.status(400).json({ message: "Realm name is required." });
    }

    realm.id = new ObjectId();
    const result = await collections.realms?.insertOne(realm);

    if (result) {
      const insertedRealm = await collections.realms?.findOne({ _id: result.insertedId });
      res.status(201).json(insertedRealm);
    } else {
      res.status(500).json({ message: "Failed to create realm." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all realms
export const getAllRealms = async (_req: Request, res: Response) => {
  try {
    const realms = await collections.realms?.find({}).toArray();
    res.status(200).json(realms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single realm by ID
export const getRealmById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid realm ID." });
    }

    const realm = await collections.realms?.findOne({ _id: new ObjectId(id) });

    if (realm) {
      res.status(200).json(realm);
    } else {
      res.status(404).json({ message: "Realm not found." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a realm by ID
export const updateRealm = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid realm ID." });
    }

    const result = await collections.realms?.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result?.matchedCount && result.modifiedCount) {
      const updatedRealm = await collections.realms?.findOne({ _id: new ObjectId(id) });
      res.status(200).json(updatedRealm);
    } else {
      res.status(304).json({ message: "Realm not updated." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a realm by ID
export const deleteRealm = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid realm ID." });
    }

    const result = await collections.realms?.deleteOne({ _id: new ObjectId(id) });

    if (result?.deletedCount) {
      res.status(202).send(`Realm with ID ${id} has been deleted.`);
    } else {
      res.status(404).json({ message: "Realm not found." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// POST /api/realms - Create a new realm
router.post("/", createRealm);

// GET /api/realms - Retrieve all realms
router.get("/", getAllRealms);

// GET /api/realms/:id - Retrieve a specific realm by ID
router.get("/:id", getRealmById);

// PUT /api/realms/:id - Update a specific realm by ID
router.put("/:id", updateRealm);

// DELETE /api/realms/:id - Delete a specific realm by ID
router.delete("/:id", deleteRealm);

module.exports = router;