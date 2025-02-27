import express, { Request, Response } from "express";
import { Realm } from "../models/realms/realm";
import RealmManagementRepo from "../database/repos/RealmManagementRepo";
import UserManagementRepo from '../database/repos/UserManagementRepo';
import ClientManagementRepo from "../database/repos/ClientManagementRepo";
import { RegisterUserDTO } from '../dto/registerUserDto';
import { Client } from "../models/clients/Client";
import RealmAuthorizationRepo from "../database/repos/RealmAuthorizationRepo";
const router = express.Router();


const handleError = (res: Response, error: any) => {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
};

// Realm Routes
router.post("/", async (req: Request, res: Response) => {
  try {
    const realm = req.body as Realm;
    if (!realm.realm_id) return res.status(400).json({ message: "Realm name is required." });
    let result = await RealmManagementRepo.createRealm(realm);
    result ? res.status(201).json(await RealmManagementRepo.getRealmById(realm.realm_id)) :
            res.status(500).json({ message: "Failed to create realm." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const realms = await RealmManagementRepo.getRealms();
    res.status(200).json(realms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const realm_id = req.params.id;
    const realm = await RealmManagementRepo.getRealmById(realm_id);
    realm ? res.status(200).json(realm) : res.status(404).json({ message: "Realm not found." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let authInfo = await RealmAuthorizationRepo.GetRealmUsers(id);
    authInfo.forEach(async user => {
      await RealmAuthorizationRepo.RemoveUserFromRealm(id, user.user_id.id.toString());
    });
    const result = await RealmManagementRepo.deleteRealm(id);
    result ? res.status(200).json({ message: "Realm deleted successfully." }) :
            res.status(404).json({ message: "Realm not found." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/register", async (req, res) => {
  try {
    let registerUserDto = req.body as RegisterUserDTO;
    let registeredUser = await UserManagementRepo.RegisterUser(registerUserDto);
    if (!registeredUser) return res.status(500).json({ message: "Failed to register user." });
    let result = await RealmAuthorizationRepo.RegisterUserToRealm(req.params.id, registeredUser.user_id.id.toString());
    result ? res.status(201).json({ message: "User registered successfully." }) :
            res.status(500).json({ message: "Failed to register user." });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
});

// Routes for client management
router.get('/:_realm/clients', async (req: Request, res: Response) => {
  try {
      const realm = req.params._realm;
      const clients = await ClientManagementRepo.getAllClients();
      res.status(200).json(clients);
  } catch (error) {
      handleError(res, error);
  }
});

router.post('/:_realm/clients', async (req: Request, res: Response) => {
  try {
      const realm = req.params._realm;
      const client = req.body as Omit<Client, "_id" | "createdAt" | "updatedAt">;
      
      // Validate required fields
      if (!client.name || !client.description) {
          return res.status(400).json({ error: "Name and description are required" });
      }

      const createdClient = await ClientManagementRepo.createClient(client);
      res.status(201).json(createdClient);
  } catch (error) {
      if (error.message.includes("Client with this name already exists")) {
          res.status(400).json({ error: "Client with this name already exists" });
      } else {
          handleError(res, error);
      }
  }
});

router.get('/:_realm/clients/:clientId', async (req: Request, res: Response) => {
  try {
      const realm = req.params._realm;
      const clientId = req.params.clientId;

      const client = await ClientManagementRepo.getClient(clientId);
      if (!client) {
          return res.status(404).json({ error: "Client not found" });
      }
      res.status(200).json(client);
  } catch (error) {
      handleError(res, error);
  }
});

router.put('/:_realm/clients/:clientId', async (req: Request, res: Response) => {
  try {
      const realm = req.params._realm;
      const clientId = req.params.clientId;
      const updates = req.body as Partial<Client>;

      const updatedClient = await ClientManagementRepo.updateClient(clientId, updates);
      if (!updatedClient) {
          return res.status(404).json({ error: "Client not found" });
      }
      res.status(200).json(updatedClient);
  } catch (error) {
      handleError(res, error);
  }
});

router.delete('/:_realm/:clientId', async (req: Request, res: Response) => {
  try {
      const realm = req.params._realm;
      const clientId = req.params.clientId;

      await ClientManagementRepo.deleteClient(clientId);
      res.status(204).json({});
  } catch (error) {
      if (error.message.includes("Client not found")) {
          res.status(404).json({ error: "Client not found" });
      } else {
          handleError(res, error);
      }
  }
});


module.exports = router;