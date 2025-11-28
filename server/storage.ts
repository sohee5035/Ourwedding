import { 
  type WeddingInfo, type InsertWeddingInfo,
  type Venue, type InsertVenue,
  type VenueQuote, type InsertVenueQuote,
  type ChecklistItem, type InsertChecklistItem,
  type BudgetItem, type InsertBudgetItem,
  type Guest, type InsertGuest,
  type SharedNote, type InsertSharedNote,
  type Couple, type InsertCouple,
  type Member, type InsertMember,
  type CalendarEvent, type InsertCalendarEvent,
  weddingInfo, venues, venueQuotes, checklistItems, budgetItems, guests, sharedNotes, couples, members, calendarEvents
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Wedding Info
  getWeddingInfo(): Promise<WeddingInfo | undefined>;
  updateWeddingInfo(info: Partial<InsertWeddingInfo>): Promise<WeddingInfo>;

  // Venues
  getVenues(): Promise<Venue[]>;
  getVenue(id: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue>;
  deleteVenue(id: string): Promise<void>;

  // Venue Quotes
  getVenueQuotes(venueId: string): Promise<VenueQuote[]>;
  getAllVenueQuotes(): Promise<VenueQuote[]>;
  getVenueQuote(id: string): Promise<VenueQuote | undefined>;
  createVenueQuote(quote: InsertVenueQuote): Promise<VenueQuote>;
  updateVenueQuote(id: string, quote: Partial<InsertVenueQuote>): Promise<VenueQuote>;
  deleteVenueQuote(id: string): Promise<void>;

  // Checklist
  getChecklistItems(): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, item: Partial<InsertChecklistItem>): Promise<ChecklistItem>;
  deleteChecklistItem(id: string): Promise<void>;

  // Budget
  getBudgetItems(): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: string, item: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  deleteBudgetItem(id: string): Promise<void>;

  // Guests
  getGuests(): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest>;
  deleteGuest(id: string): Promise<void>;

  // Shared Notes
  getSharedNotes(): Promise<SharedNote[]>;
  getSharedNotesByCoupleId(coupleId: string): Promise<SharedNote[]>;
  createSharedNote(note: InsertSharedNote): Promise<SharedNote>;
  updateSharedNote(id: string, content: string): Promise<SharedNote>;
  deleteSharedNote(id: string): Promise<void>;

  // Couples
  createCouple(couple: InsertCouple): Promise<Couple>;
  getCouple(id: string): Promise<Couple | undefined>;
  getCoupleByInviteCode(inviteCode: string): Promise<Couple | undefined>;
  regenerateInviteCode(coupleId: string): Promise<Couple>;

  // Members
  createMember(member: InsertMember): Promise<Member>;
  getMember(id: string): Promise<Member | undefined>;
  getMemberByNameAndPinHash(name: string, pinHash: string): Promise<Member | undefined>;
  getMembersByCouple(coupleId: string): Promise<Member[]>;
  getMemberByNameInCouple(coupleId: string, name: string): Promise<Member | undefined>;
  
  // Admin
  getAllCouples(): Promise<Couple[]>;
  getAllMembers(): Promise<Member[]>;
  deleteCouple(id: string): Promise<void>;
  deleteMember(id: string): Promise<void>;

  // Calendar Events
  getCalendarEventsByCoupleId(coupleId: string): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Wedding Info
  async getWeddingInfo(): Promise<WeddingInfo | undefined> {
    const [info] = await db.select().from(weddingInfo).limit(1);
    return info || undefined;
  }

  async updateWeddingInfo(info: Partial<InsertWeddingInfo>): Promise<WeddingInfo> {
    const existing = await this.getWeddingInfo();
    
    if (existing) {
      const [updated] = await db
        .update(weddingInfo)
        .set({ ...info, updatedAt: new Date() })
        .where(eq(weddingInfo.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(weddingInfo)
        .values(info)
        .returning();
      return created;
    }
  }

  // Venues
  async getVenues(): Promise<Venue[]> {
    return await db.select().from(venues).orderBy(venues.createdAt);
  }

  async getVenue(id: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue || undefined;
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [created] = await db.insert(venues).values(venue).returning();
    return created;
  }

  async updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue> {
    const [updated] = await db
      .update(venues)
      .set({ ...venue, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return updated;
  }

  async deleteVenue(id: string): Promise<void> {
    await db.delete(venues).where(eq(venues.id, id));
  }

  // Venue Quotes
  async getVenueQuotes(venueId: string): Promise<VenueQuote[]> {
    return await db.select().from(venueQuotes).where(eq(venueQuotes.venueId, venueId)).orderBy(venueQuotes.createdAt);
  }

  async getAllVenueQuotes(): Promise<VenueQuote[]> {
    return await db.select().from(venueQuotes).orderBy(venueQuotes.createdAt);
  }

  async getVenueQuote(id: string): Promise<VenueQuote | undefined> {
    const [quote] = await db.select().from(venueQuotes).where(eq(venueQuotes.id, id));
    return quote || undefined;
  }

  async createVenueQuote(quote: InsertVenueQuote): Promise<VenueQuote> {
    const [created] = await db.insert(venueQuotes).values(quote).returning();
    return created;
  }

  async updateVenueQuote(id: string, quote: Partial<InsertVenueQuote>): Promise<VenueQuote> {
    const [updated] = await db
      .update(venueQuotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(venueQuotes.id, id))
      .returning();
    return updated;
  }

  async deleteVenueQuote(id: string): Promise<void> {
    await db.delete(venueQuotes).where(eq(venueQuotes.id, id));
  }

  // Checklist
  async getChecklistItems(): Promise<ChecklistItem[]> {
    return await db.select().from(checklistItems).orderBy(checklistItems.createdAt);
  }

  async createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem> {
    const [created] = await db.insert(checklistItems).values(item).returning();
    return created;
  }

  async updateChecklistItem(id: string, item: Partial<InsertChecklistItem>): Promise<ChecklistItem> {
    const [updated] = await db
      .update(checklistItems)
      .set(item)
      .where(eq(checklistItems.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    await db.delete(checklistItems).where(eq(checklistItems.id, id));
  }

  // Budget
  async getBudgetItems(): Promise<BudgetItem[]> {
    return await db.select().from(budgetItems).orderBy(budgetItems.createdAt);
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const [created] = await db.insert(budgetItems).values(item).returning();
    return created;
  }

  async updateBudgetItem(id: string, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const [updated] = await db
      .update(budgetItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(budgetItems.id, id))
      .returning();
    return updated;
  }

  async deleteBudgetItem(id: string): Promise<void> {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }

  // Guests
  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests).orderBy(guests.createdAt);
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [created] = await db.insert(guests).values(guest).returning();
    return created;
  }

  async updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest> {
    const [updated] = await db
      .update(guests)
      .set(guest)
      .where(eq(guests.id, id))
      .returning();
    return updated;
  }

  async deleteGuest(id: string): Promise<void> {
    await db.delete(guests).where(eq(guests.id, id));
  }

  // Shared Notes
  async getSharedNotes(): Promise<SharedNote[]> {
    return await db.select().from(sharedNotes).orderBy(sharedNotes.createdAt);
  }

  async getSharedNotesByCoupleId(coupleId: string): Promise<SharedNote[]> {
    return await db.select().from(sharedNotes).where(eq(sharedNotes.coupleId, coupleId)).orderBy(sharedNotes.createdAt);
  }

  async createSharedNote(note: InsertSharedNote): Promise<SharedNote> {
    const [created] = await db.insert(sharedNotes).values(note).returning();
    return created;
  }

  async updateSharedNote(id: string, content: string): Promise<SharedNote> {
    const [updated] = await db
      .update(sharedNotes)
      .set({ content })
      .where(eq(sharedNotes.id, id))
      .returning();
    return updated;
  }

  async deleteSharedNote(id: string): Promise<void> {
    await db.delete(sharedNotes).where(eq(sharedNotes.id, id));
  }

  // Couples
  async createCouple(couple: InsertCouple): Promise<Couple> {
    const [created] = await db.insert(couples).values(couple).returning();
    return created;
  }

  async getCouple(id: string): Promise<Couple | undefined> {
    const [couple] = await db.select().from(couples).where(eq(couples.id, id));
    return couple || undefined;
  }

  async getCoupleByInviteCode(inviteCode: string): Promise<Couple | undefined> {
    const [couple] = await db.select().from(couples).where(eq(couples.inviteCode, inviteCode));
    return couple || undefined;
  }

  async regenerateInviteCode(coupleId: string): Promise<Couple> {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [updated] = await db
      .update(couples)
      .set({ inviteCode: newCode })
      .where(eq(couples.id, coupleId))
      .returning();
    return updated;
  }

  // Members
  async createMember(member: InsertMember): Promise<Member> {
    const [created] = await db.insert(members).values(member).returning();
    return created;
  }

  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async getMemberByNameAndPinHash(name: string, pinHash: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(
      and(eq(members.name, name), eq(members.pinHash, pinHash))
    );
    return member || undefined;
  }

  async getMembersByCouple(coupleId: string): Promise<Member[]> {
    return await db.select().from(members).where(eq(members.coupleId, coupleId));
  }

  async getMemberByNameInCouple(coupleId: string, name: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(
      and(eq(members.coupleId, coupleId), eq(members.name, name))
    );
    return member || undefined;
  }

  // Admin
  async getAllCouples(): Promise<Couple[]> {
    return await db.select().from(couples).orderBy(couples.createdAt);
  }

  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(members.createdAt);
  }

  async deleteCouple(id: string): Promise<void> {
    await db.delete(couples).where(eq(couples.id, id));
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  // Calendar Events
  async getCalendarEventsByCoupleId(coupleId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.coupleId, coupleId)).orderBy(calendarEvents.date);
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [created] = await db.insert(calendarEvents).values(event).returning();
    return created;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updated] = await db
      .update(calendarEvents)
      .set(event)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }
}

export const storage = new DatabaseStorage();
