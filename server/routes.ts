import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createHash } from "crypto";
import { z } from "zod";
import { 
  insertWeddingInfoSchema, 
  insertVenueSchema, 
  insertVenueQuoteSchema,
  insertChecklistItemSchema,
  insertBudgetItemSchema,
  insertGuestSchema,
  insertSharedNoteSchema,
  insertCalendarEventSchema,
  insertEventCategorySchema
} from "@shared/schema";

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

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

  // Venue Quotes
  app.get("/api/venue-quotes", async (req, res) => {
    try {
      const quotes = await storage.getAllVenueQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quotes" });
    }
  });

  app.get("/api/venues/:venueId/quotes", async (req, res) => {
    try {
      const quotes = await storage.getVenueQuotes(req.params.venueId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quotes" });
    }
  });

  app.get("/api/venue-quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getVenueQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Venue quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to get venue quote" });
    }
  });

  app.post("/api/venue-quotes", async (req, res) => {
    try {
      const parsed = insertVenueQuoteSchema.parse(req.body);
      const quote = await storage.createVenueQuote(parsed);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue quote data" });
    }
  });

  app.patch("/api/venue-quotes/:id", async (req, res) => {
    try {
      const parsed = insertVenueQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateVenueQuote(req.params.id, parsed);
      res.json(quote);
    } catch (error) {
      res.status(400).json({ error: "Invalid venue quote data" });
    }
  });

  app.delete("/api/venue-quotes/:id", async (req, res) => {
    try {
      await storage.deleteVenueQuote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete venue quote" });
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

  // Shared Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getSharedNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const parsed = insertSharedNoteSchema.parse(req.body);
      const note = await storage.createSharedNote(parsed);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
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
      await storage.deleteSharedNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Auth - Register (first member creates couple)
  const registerSchema = z.object({
    name: z.string().min(1),
    pin: z.string().length(4).regex(/^\d{4}$/),
    role: z.enum(['bride', 'groom']),
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, pin, role } = registerSchema.parse(req.body);
      
      const inviteCode = generateInviteCode();
      const couple = await storage.createCouple({ inviteCode });
      
      const pinHash = hashPin(pin);
      const member = await storage.createMember({
        coupleId: couple.id,
        name,
        pinHash,
        role,
      });
      
      req.session.memberId = member.id;
      req.session.coupleId = couple.id;
      
      res.status(201).json({
        member: { id: member.id, name: member.name, coupleId: member.coupleId, role: member.role },
        couple: { id: couple.id, inviteCode: couple.inviteCode },
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
    pin: z.string().length(4).regex(/^\d{4}$/),
    inviteCode: z.string().length(6),
  });

  app.post("/api/auth/join", async (req, res) => {
    try {
      const { name, pin, inviteCode } = joinSchema.parse(req.body);
      
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
      
      const pinHash = hashPin(pin);
      const member = await storage.createMember({
        coupleId: couple.id,
        name,
        pinHash,
        role,
      });
      
      req.session.memberId = member.id;
      req.session.coupleId = couple.id;
      
      res.status(201).json({
        member: { id: member.id, name: member.name, coupleId: member.coupleId, role: member.role },
        couple: { id: couple.id },
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "합류에 실패했습니다" });
    }
  });

  // Auth - Login
  const loginSchema = z.object({
    name: z.string().min(1),
    pin: z.string().length(4).regex(/^\d{4}$/),
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { name, pin } = loginSchema.parse(req.body);
      
      const pinHash = hashPin(pin);
      const member = await storage.getMemberByNameAndPinHash(name, pinHash);
      if (!member) {
        return res.status(401).json({ error: "이름 또는 비밀번호가 올바르지 않습니다" });
      }
      
      req.session.memberId = member.id;
      req.session.coupleId = member.coupleId;
      
      const couple = member.coupleId ? await storage.getCouple(member.coupleId) : null;
      
      res.json({
        member: { id: member.id, name: member.name, coupleId: member.coupleId },
        couple: couple ? { id: couple.id, inviteCode: couple.inviteCode } : null,
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

  app.post("/api/admin/login", (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      
      const adminPassword = process.env.ADMIN_PASSWORD || '1122';
      
      if (password !== adminPassword) {
        return res.status(401).json({ error: "비밀번호가 일치하지 않습니다" });
      }
      
      req.session.isAdmin = true;
      res.json({ success: true });
    } catch (error) {
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
      const parsed = insertCalendarEventSchema.partial().parse(req.body);
      const event = await storage.updateCalendarEvent(req.params.id, parsed);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "일정 수정에 실패했습니다" });
    }
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    try {
      await storage.deleteCalendarEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "일정 삭제에 실패했습니다" });
    }
  });

  // Event Categories
  app.get("/api/event-categories", async (req, res) => {
    try {
      if (!req.session.coupleId) {
        return res.status(401).json({ error: "로그인이 필요합니다" });
      }
      const categories = await storage.getEventCategoriesByCoupleId(req.session.coupleId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "카테고리를 가져오는데 실패했습니다" });
    }
  });

  app.post("/api/event-categories", async (req, res) => {
    try {
      if (!req.session.coupleId) {
        return res.status(401).json({ error: "로그인이 필요합니다" });
      }
      const parsed = insertEventCategorySchema.parse({
        ...req.body,
        coupleId: req.session.coupleId,
      });
      const category = await storage.createEventCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "카테고리 생성에 실패했습니다" });
    }
  });

  app.delete("/api/event-categories/:id", async (req, res) => {
    try {
      await storage.deleteEventCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "카테고리 삭제에 실패했습니다" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
