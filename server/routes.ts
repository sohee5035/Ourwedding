import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWeddingInfoSchema, 
  insertVenueSchema, 
  insertChecklistItemSchema,
  insertBudgetItemSchema,
  insertGuestSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Wedding Info
  app.get("/api/wedding-info", async (req, res) => {
    try {
      const info = await storage.getWeddingInfo();
      res.json(info || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to get wedding info" });
    }
  });

  app.put("/api/wedding-info", async (req, res) => {
    try {
      const parsed = insertWeddingInfoSchema.partial().parse(req.body);
      const info = await storage.updateWeddingInfo(parsed);
      res.json(info);
    } catch (error) {
      res.status(400).json({ error: "Invalid wedding info data" });
    }
  });

  // Venues
  app.get("/api/venues", async (req, res) => {
    try {
      const venues = await storage.getVenues();
      res.json(venues);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venues" });
    }
  });

  app.get("/api/venues/:id", async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.id);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue" });
    }
  });

  app.post("/api/venues", async (req, res) => {
    try {
      const parsed = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(parsed);
      res.status(201).json(venue);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue data" });
    }
  });

  app.patch("/api/venues/:id", async (req, res) => {
    try {
      const parsed = insertVenueSchema.partial().parse(req.body);
      const venue = await storage.updateVenue(req.params.id, parsed);
      res.json(venue);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue data" });
    }
  });

  app.delete("/api/venues/:id", async (req, res) => {
    try {
      await storage.deleteVenue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete venue" });
    }
  });

  // Checklist
  app.get("/api/checklist", async (req, res) => {
    try {
      const items = await storage.getChecklistItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get checklist items" });
    }
  });

  app.post("/api/checklist", async (req, res) => {
    try {
      const parsed = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid checklist item data" });
    }
  });

  app.patch("/api/checklist/:id", async (req, res) => {
    try {
      const parsed = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(req.params.id, parsed);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid checklist item data" });
    }
  });

  app.delete("/api/checklist/:id", async (req, res) => {
    try {
      await storage.deleteChecklistItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete checklist item" });
    }
  });

  // Budget
  app.get("/api/budget", async (req, res) => {
    try {
      const items = await storage.getBudgetItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get budget items" });
    }
  });

  app.post("/api/budget", async (req, res) => {
    try {
      const parsed = insertBudgetItemSchema.parse(req.body);
      const item = await storage.createBudgetItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.patch("/api/budget/:id", async (req, res) => {
    try {
      const parsed = insertBudgetItemSchema.partial().parse(req.body);
      const item = await storage.updateBudgetItem(req.params.id, parsed);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.delete("/api/budget/:id", async (req, res) => {
    try {
      await storage.deleteBudgetItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget item" });
    }
  });

  // Guests
  app.get("/api/guests", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to get guests" });
    }
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const parsed = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(parsed);
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.patch("/api/guests/:id", async (req, res) => {
    try {
      const parsed = insertGuestSchema.partial().parse(req.body);
      const guest = await storage.updateGuest(req.params.id, parsed);
      res.json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.delete("/api/guests/:id", async (req, res) => {
    try {
      await storage.deleteGuest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete guest" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
