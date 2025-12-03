import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
import multer from "multer";
import { 
  insertWeddingInfoSchema, 
  insertVenueSchema, 
  insertVenueQuoteSchema,
  insertChecklistItemSchema,
  insertBudgetItemSchema,
  insertGuestSchema,
  insertGroupGuestSchema,
  insertSharedNoteSchema,
  insertCalendarEventSchema,
  insertEventCategorySchema
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });
const BCRYPT_ROUNDS = 12;

function getCloudinary() {
  const { v2: cloudinary } = require("cloudinary");
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    let configUrl = url;
    if (!url.startsWith('cloudinary://')) {
      configUrl = `cloudinary://${url}`;
    }
    cloudinary.config({ cloudinary_url: configUrl });
  }
  return cloudinary;
}

function hashPinSha256(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password: string, hash: string, algorithm: string): Promise<boolean> {
  if (algorithm === 'bcrypt') {
    return bcrypt.compare(password, hash);
  } else {
    return hashPinSha256(password) === hash;
  }
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function requireAuth(req: any, res: any): string | null {
  const coupleId = req.session?.coupleId;
  if (!coupleId) {
    console.error('Auth failed - Session data:', {
      sessionExists: !!req.session,
      sessionID: req.sessionID,
      memberId: req.session?.memberId,
      coupleId: req.session?.coupleId,
      cookie: req.session?.cookie
    });
    res.status(401).json({ error: "로그인이 필요합니다" });
    return null;
  }
  return coupleId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Wedding Info
  app.get("/api/wedding-info", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const info = await storage.getWeddingInfo(coupleId);
      res.json(info || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to get wedding info" });
    }
  });

  app.put("/api/wedding-info", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertWeddingInfoSchema.partial().parse(req.body);
      const info = await storage.updateWeddingInfo(coupleId, parsed);
      res.json(info);
    } catch (error) {
      res.status(400).json({ error: "Invalid wedding info data" });
    }
  });

  // Venues
  app.get("/api/venues", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const venues = await storage.getVenues(coupleId);
      res.json(venues);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venues" });
    }
  });

  app.get("/api/venues/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const venue = await storage.getVenue(req.params.id);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue" });
    }
  });

  app.post("/api/venues", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue({ ...parsed, coupleId });
      res.status(201).json(venue);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue data" });
    }
  });

  app.patch("/api/venues/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existingVenue = await storage.getVenue(req.params.id);
      if (!existingVenue || existingVenue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue not found" });
      }
      const parsed = insertVenueSchema.partial().parse(req.body);
      const venue = await storage.updateVenue(req.params.id, parsed);
      res.json(venue);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue data" });
    }
  });

  app.delete("/api/venues/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existingVenue = await storage.getVenue(req.params.id);
      if (!existingVenue || existingVenue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue not found" });
      }
      await storage.deleteVenue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete venue" });
    }
  });

  // Image Upload (Cloudinary)
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const cloudinary = getCloudinary();
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "wedding-venues",
            transformation: [
              { width: 1200, height: 800, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" }
            ]
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  app.delete("/api/upload/:publicId", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      
      const publicId = decodeURIComponent(req.params.publicId);
      
      const venues = await storage.getVenues(coupleId);
      const imageOwned = venues.some(venue => 
        venue.photos?.some(photo => photo.publicId === publicId)
      );
      
      if (!imageOwned) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(publicId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Venue Quotes
  app.get("/api/venue-quotes", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const quotes = await storage.getAllVenueQuotes(coupleId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quotes" });
    }
  });

  app.get("/api/venues/:venueId/quotes", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const venue = await storage.getVenue(req.params.venueId);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue not found" });
      }
      const quotes = await storage.getVenueQuotes(req.params.venueId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quotes" });
    }
  });

  app.get("/api/venue-quotes/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const quote = await storage.getVenueQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      const venue = await storage.getVenue(quote.venueId);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quote" });
    }
  });

  app.post("/api/venue-quotes", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertVenueQuoteSchema.parse(req.body);
      const venue = await storage.getVenue(parsed.venueId);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue not found" });
      }
      const quote = await storage.createVenueQuote(parsed);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue quote data" });
    }
  });

  app.patch("/api/venue-quotes/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existingQuote = await storage.getVenueQuote(req.params.id);
      if (!existingQuote) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      const venue = await storage.getVenue(existingQuote.venueId);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      const parsed = insertVenueQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateVenueQuote(req.params.id, parsed);
      res.json(quote);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue quote data" });
    }
  });

  app.delete("/api/venue-quotes/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existingQuote = await storage.getVenueQuote(req.params.id);
      if (!existingQuote) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      const venue = await storage.getVenue(existingQuote.venueId);
      if (!venue || venue.coupleId !== coupleId) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      await storage.deleteVenueQuote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete venue quote" });
    }
  });

  // Checklist
  app.get("/api/checklist", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const items = await storage.getChecklistItems(coupleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get checklist items" });
    }
  });

  app.post("/api/checklist", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem({ ...parsed, coupleId });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid checklist item data" });
    }
  });

  app.patch("/api/checklist/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getChecklistItem(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Checklist item not found" });
      }
      const parsed = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(req.params.id, parsed);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid checklist item data" });
    }
  });

  app.delete("/api/checklist/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getChecklistItem(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Checklist item not found" });
      }
      await storage.deleteChecklistItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete checklist item" });
    }
  });

  // Budget
  app.get("/api/budget", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const items = await storage.getBudgetItems(coupleId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get budget items" });
    }
  });

  app.post("/api/budget", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertBudgetItemSchema.parse(req.body);
      const item = await storage.createBudgetItem({ ...parsed, coupleId });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.patch("/api/budget/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getBudgetItem(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      const parsed = insertBudgetItemSchema.partial().parse(req.body);
      const item = await storage.updateBudgetItem(req.params.id, parsed);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget item data" });
    }
  });

  app.delete("/api/budget/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getBudgetItem(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      await storage.deleteBudgetItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget item" });
    }
  });

  // Guests
  app.get("/api/guests", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const guests = await storage.getGuests(coupleId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to get guests" });
    }
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest({ ...parsed, coupleId });
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.patch("/api/guests/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getGuest(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Guest not found" });
      }
      const parsed = insertGuestSchema.partial().parse(req.body);
      const guest = await storage.updateGuest(req.params.id, parsed);
      res.json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.delete("/api/guests/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getGuest(req.params.id);
      if (!existing) {
        console.error(`Delete failed - Guest not found: ${req.params.id}`);
        return res.status(404).json({ error: "Guest not found" });
      }
      if (existing.coupleId !== coupleId) {
        console.error(`Delete failed - Guest belongs to different couple. Guest ID: ${req.params.id}, Guest coupleId: ${existing.coupleId}, Session coupleId: ${coupleId}`);
        return res.status(404).json({ error: "Guest not found" });
      }
      await storage.deleteGuest(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting guest:', error);
      res.status(500).json({ error: "Failed to delete guest" });
    }
  });

  // Group Guests
  app.get("/api/group-guests", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const groupGuests = await storage.getGroupGuests(coupleId);
      res.json(groupGuests);
    } catch (error) {
      res.status(500).json({ error: "Failed to get group guests" });
    }
  });

  app.post("/api/group-guests", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertGroupGuestSchema.parse(req.body);
      const groupGuest = await storage.createGroupGuest({ ...parsed, coupleId });
      res.status(201).json(groupGuest);
    } catch (error) {
      res.status(400).json({ error: "Invalid group guest data" });
    }
  });

  app.patch("/api/group-guests/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const groupGuests = await storage.getGroupGuests(coupleId);
      const existing = groupGuests.find(g => g.id === req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Group guest not found" });
      }
      const parsed = insertGroupGuestSchema.partial().parse(req.body);
      const groupGuest = await storage.updateGroupGuest(req.params.id, parsed);
      res.json(groupGuest);
    } catch (error) {
      res.status(400).json({ error: "Invalid group guest data" });
    }
  });

  app.delete("/api/group-guests/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const groupGuests = await storage.getGroupGuests(coupleId);
      const existing = groupGuests.find(g => g.id === req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Group guest not found" });
      }
      await storage.deleteGroupGuest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group guest" });
    }
  });

  // Shared Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const notes = await storage.getSharedNotesByCoupleId(coupleId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertSharedNoteSchema.parse(req.body);
      const note = await storage.createSharedNote({ ...parsed, coupleId });
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getSharedNote(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Note not found" });
      }
      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Content is required" });
      }
      const note = await storage.updateSharedNote(req.params.id, content);
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getSharedNote(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "Note not found" });
      }
      await storage.deleteSharedNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Auth - Register (first member creates couple)
  const registerSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    role: z.enum(['bride', 'groom']),
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, password, role } = registerSchema.parse(req.body);

      const inviteCode = generateInviteCode();
      const couple = await storage.createCouple({ inviteCode });

      const pinHash = await hashPassword(password);
      const member = await storage.createMember({
        coupleId: couple.id,
        name,
        pinHash,
        hashAlgorithm: 'bcrypt',
        role,
      });

      req.session.memberId = member.id;
      req.session.coupleId = couple.id;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "세션 저장에 실패했습니다" });
        }

        res.status(201).json({
          member: { id: member.id, name: member.name, coupleId: member.coupleId, role: member.role },
          couple: { id: couple.id, inviteCode: couple.inviteCode },
        });
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "가입에 실패했습니다" });
    }
  });

  // Auth - Check invite code (preview assigned role)
  app.get("/api/auth/invite/:code", async (req, res) => {
    try {
      const code = req.params.code.toUpperCase();
      const couple = await storage.getCoupleByInviteCode(code);
      
      if (!couple) {
        return res.json({ valid: false, error: "잘못된 초대 코드입니다" });
      }
      
      const existingMembers = await storage.getMembersByCouple(couple.id);
      if (existingMembers.length >= 2) {
        return res.json({ valid: false, error: "이미 커플이 완성되었습니다" });
      }
      
      const firstMemberRole = existingMembers[0]?.role || 'bride';
      const assignedRole = firstMemberRole === 'bride' ? 'groom' : 'bride';
      const partnerName = existingMembers[0]?.name || '';
      
      res.json({ valid: true, assignedRole, partnerName });
    } catch (error) {
      res.json({ valid: false, error: "초대 코드 확인에 실패했습니다" });
    }
  });

  // Auth - Join (second member joins with invite code)
  const joinSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    inviteCode: z.string().length(6),
  });

  app.post("/api/auth/join", async (req, res) => {
    try {
      const { name, password, inviteCode } = joinSchema.parse(req.body);

      const couple = await storage.getCoupleByInviteCode(inviteCode.toUpperCase());
      if (!couple) {
        return res.status(400).json({ error: "잘못된 초대 코드입니다" });
      }

      const existingMembers = await storage.getMembersByCouple(couple.id);
      if (existingMembers.length >= 2) {
        return res.status(400).json({ error: "이미 커플이 완성되었습니다" });
      }

      const sameNameInCouple = await storage.getMemberByNameInCouple(couple.id, name);
      if (sameNameInCouple) {
        return res.status(400).json({ error: "같은 커플 내에 동일한 이름이 있습니다" });
      }

      const firstMemberRole = existingMembers[0]?.role || 'bride';
      const role = firstMemberRole === 'bride' ? 'groom' : 'bride';

      const pinHash = await hashPassword(password);
      const member = await storage.createMember({
        coupleId: couple.id,
        name,
        pinHash,
        hashAlgorithm: 'bcrypt',
        role,
      });

      req.session.memberId = member.id;
      req.session.coupleId = couple.id;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "세션 저장에 실패했습니다" });
        }

        res.status(201).json({
          member: { id: member.id, name: member.name, coupleId: member.coupleId, role: member.role },
          couple: { id: couple.id },
        });
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "합류에 실패했습니다" });
    }
  });

  // Auth - Login
  const loginSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(1),
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { name, password } = loginSchema.parse(req.body);

      const member = await storage.getMemberByName(name);
      if (!member) {
        return res.status(401).json({ error: "이름 또는 비밀번호가 올바르지 않습니다" });
      }

      const isValid = await verifyPassword(password, member.pinHash, member.hashAlgorithm || 'sha256');
      if (!isValid) {
        return res.status(401).json({ error: "이름 또는 비밀번호가 올바르지 않습니다" });
      }

      if (member.hashAlgorithm !== 'bcrypt') {
        const newHash = await hashPassword(password);
        await storage.updateMemberPassword(member.id, newHash, 'bcrypt');
      }

      req.session.memberId = member.id;
      req.session.coupleId = member.coupleId;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "세션 저장에 실패했습니다" });
        }

        console.log('Session saved successfully:', {
          sessionID: req.sessionID,
          memberId: req.session.memberId,
          coupleId: req.session.coupleId,
          cookie: req.session.cookie
        });

        const couple = member.coupleId ? storage.getCouple(member.coupleId) : Promise.resolve(null);
        couple.then((coupleData) => {
          res.json({
            member: { id: member.id, name: member.name, coupleId: member.coupleId },
            couple: coupleData ? { id: coupleData.id, inviteCode: coupleData.inviteCode } : null,
          });
        }).catch((error) => {
          console.error(error);
          res.status(500).json({ error: "커플 정보를 가져오는데 실패했습니다" });
        });
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "로그인에 실패했습니다" });
    }
  });

  // Auth - Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "로그아웃에 실패했습니다" });
      }
      res.json({ success: true });
    });
  });

  // Auth - Get current session
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.memberId) {
        return res.json({ member: null, couple: null, partner: null });
      }
      
      const member = await storage.getMember(req.session.memberId);
      if (!member) {
        return res.json({ member: null, couple: null, partner: null });
      }
      
      const couple = member.coupleId ? await storage.getCouple(member.coupleId) : null;
      const members = member.coupleId ? await storage.getMembersByCouple(member.coupleId) : [];
      const partner = members.find(m => m.id !== member.id);
      
      res.json({
        member: { id: member.id, name: member.name, coupleId: member.coupleId, role: member.role },
        couple: couple ? { id: couple.id, inviteCode: couple.inviteCode } : null,
        partner: partner ? { id: partner.id, name: partner.name, role: partner.role } : null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "세션 정보를 가져오는데 실패했습니다" });
    }
  });

  // Admin - Login
  const adminLoginSchema = z.object({
    password: z.string().min(1),
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);

      const adminSettings = await storage.getAdminSettings();

      if (adminSettings) {
        const isValid = await verifyPassword(password, adminSettings.passwordHash, adminSettings.hashAlgorithm);
        if (!isValid) {
          return res.status(401).json({ error: "비밀번호가 일치하지 않습니다" });
        }
      } else {
        const envPassword = process.env.ADMIN_PASSWORD || 'wed1122';
        if (password !== envPassword) {
          return res.status(401).json({ error: "비밀번호가 일치하지 않습니다" });
        }
        const hashedPassword = await hashPassword(envPassword);
        await storage.createAdminSettings({ passwordHash: hashedPassword, hashAlgorithm: 'bcrypt' });
      }

      req.session.isAdmin = true;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "세션 저장에 실패했습니다" });
        }

        res.json({ success: true });
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "로그인에 실패했습니다" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });

  app.get("/api/admin/me", (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });

  // Admin - Change password
  const adminChangePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다"),
  });

  app.post("/api/admin/change-password", async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 필요합니다" });
    }
    
    try {
      const { currentPassword, newPassword } = adminChangePasswordSchema.parse(req.body);
      
      const adminSettings = await storage.getAdminSettings();
      
      if (adminSettings) {
        const isValid = await verifyPassword(currentPassword, adminSettings.passwordHash, adminSettings.hashAlgorithm);
        if (!isValid) {
          return res.status(401).json({ error: "현재 비밀번호가 일치하지 않습니다" });
        }
      } else {
        const envPassword = process.env.ADMIN_PASSWORD || 'wed1122';
        if (currentPassword !== envPassword) {
          return res.status(401).json({ error: "현재 비밀번호가 일치하지 않습니다" });
        }
      }
      
      const newHash = await hashPassword(newPassword);
      await storage.updateAdminSettings(newHash);
      
      res.json({ success: true, message: "비밀번호가 변경되었습니다" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "비밀번호 변경에 실패했습니다" });
    }
  });

  // Admin - Get all couples with members
  app.get("/api/admin/couples", async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 필요합니다" });
    }
    
    try {
      const allCouples = await storage.getAllCouples();
      const allMembers = await storage.getAllMembers();
      
      const couplesWithMembers = allCouples.map(couple => ({
        ...couple,
        members: allMembers.filter(m => m.coupleId === couple.id).map(m => ({
          id: m.id,
          name: m.name,
          createdAt: m.createdAt,
        })),
      }));
      
      res.json(couplesWithMembers);
    } catch (error) {
      res.status(500).json({ error: "데이터를 가져오는데 실패했습니다" });
    }
  });

  // Admin - Delete couple (and all members)
  app.delete("/api/admin/couples/:id", async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 필요합니다" });
    }
    
    try {
      await storage.deleteCouple(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "삭제에 실패했습니다" });
    }
  });

  // Admin - Delete member
  app.delete("/api/admin/members/:id", async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 필요합니다" });
    }
    
    try {
      await storage.deleteMember(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "삭제에 실패했습니다" });
    }
  });

  // Calendar Events
  app.get("/api/calendar-events", async (req, res) => {
    try {
      if (!req.session.coupleId) {
        return res.status(401).json({ error: "로그인이 필요합니다" });
      }
      const events = await storage.getCalendarEventsByCoupleId(req.session.coupleId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "일정을 가져오는데 실패했습니다" });
    }
  });

  app.post("/api/calendar-events", async (req, res) => {
    try {
      if (!req.session.coupleId) {
        return res.status(401).json({ error: "로그인이 필요합니다" });
      }
      const parsed = insertCalendarEventSchema.parse({
        ...req.body,
        coupleId: req.session.coupleId,
      });
      const event = await storage.createCalendarEvent(parsed);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "잘못된 일정 데이터입니다" });
    }
  });

  app.patch("/api/calendar-events/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getCalendarEvent(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "일정을 찾을 수 없습니다" });
      }
      const parsed = insertCalendarEventSchema.partial().parse(req.body);
      const event = await storage.updateCalendarEvent(req.params.id, parsed);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "일정 수정에 실패했습니다" });
    }
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getCalendarEvent(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "일정을 찾을 수 없습니다" });
      }
      await storage.deleteCalendarEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "일정 삭제에 실패했습니다" });
    }
  });

  // Event Categories
  app.get("/api/event-categories", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const categories = await storage.getEventCategoriesByCoupleId(coupleId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "카테고리를 가져오는데 실패했습니다" });
    }
  });

  app.post("/api/event-categories", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const parsed = insertEventCategorySchema.parse({
        ...req.body,
        coupleId,
      });
      const category = await storage.createEventCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "카테고리 생성에 실패했습니다" });
    }
  });

  app.delete("/api/event-categories/:id", async (req, res) => {
    try {
      const coupleId = requireAuth(req, res);
      if (!coupleId) return;
      const existing = await storage.getEventCategory(req.params.id);
      if (!existing || existing.coupleId !== coupleId) {
        return res.status(404).json({ error: "카테고리를 찾을 수 없습니다" });
      }
      await storage.deleteEventCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "카테고리 삭제에 실패했습니다" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
