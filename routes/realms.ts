import express, { Request, Response } from "express";
import { Realm } from "../models/realms/realm";
import RealmManagementRepo from "../database/repos/realm_management_repo";

const router = express.Router();

// Create a new realm
export const createRealm = async (req: Request, res: Response) => {
  try {
    const realm = req.body as Realm;

    // Validation: Ensure required fields are present
    if (!realm.realm_id) {
      return res.status(400).json({ message: "Realm name is required." });
    }

    // Create a new realm
    let result = await RealmManagementRepo.createRealm(realm);

    if (result === true) {
      res.status(201).json(RealmManagementRepo.getRealmById(realm.realm_id));
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
    const realms = await RealmManagementRepo.getRealms();
    res.status(200).json(realms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single realm by ID
export const getRealmById = async (req: Request, res: Response) => {
  try {
    const realm_id = req.params.realm_id;

    const realm = await RealmManagementRepo.getRealmById(realm_id);

    if (realm) {
      res.status(200).json(realm);
    } else {
      res.status(404).json({ message: "Realm not found." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a realm by ID
export const deleteRealm = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await RealmManagementRepo.deleteRealm(id);
    if (result === true) {
      res.status(200).json({ message: "Realm deleted successfully." });
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

// DELETE /api/realms/:id - Delete a specific realm by ID
router.delete("/:id", deleteRealm);

module.exports = router;