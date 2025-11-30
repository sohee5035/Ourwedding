import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const venuePhotoSchema = z.object({
  url: z.string(),
  publicId: z.string()
});

export const couples = pgTable("couples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviteCode: varchar("invite_code", { length: 6 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  pinHash: text("pin_hash").notNull(),
  hashAlgorithm: text("hash_algorithm").notNull().default('sha256'),
  role: text("role").notNull().default('bride'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  passwordHash: text("password_hash").notNull(),
  hashAlgorithm: text("hash_algorithm").notNull().default('bcrypt'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weddingInfo = pgTable("wedding_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  weddingDate: text("wedding_date"),
  groomName: text("groom_name"),
  brideName: text("bride_name"),
  totalBudget: integer("total_budget").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: real("lat").notNull().default(37.5665),
  lng: real("lng").notNull().default(126.978),
  nearestStation: text("nearest_station").default(''),
  photos: jsonb("photos").default([]).$type<Array<{ url: string; publicId: string }>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const venueQuotes = pgTable("venue_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull().references(() => venues.id, { onDelete: 'cascade' }),
  date: text("date"),
  time: text("time"),
  estimate: integer("estimate").default(0),
  minGuests: integer("min_guests").default(0),
  mealCost: integer("meal_cost").default(0),
  rentalFee: integer("rental_fee").default(0),
  memo: text("memo").default(''),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: text("due_date"),
  date: text("date"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetItems = pgTable("budget_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  category: text("category").notNull(),
  budgetAmount: integer("budget_amount").default(0),
  actualAmount: integer("actual_amount").default(0),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  phone: text("phone").default(''),
  side: text("side").notNull(),
  relation: text("relation"),
  invitationSent: boolean("invitation_sent").default(false),
  attendance: text("attendance").default('pending'),
  tableNumber: integer("table_number"),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupGuests = pgTable("group_guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  side: text("side").notNull(),
  estimatedCount: integer("estimated_count").notNull().default(1),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sharedNotes = pgTable("shared_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  memberId: varchar("member_id").references(() => members.id, { onDelete: 'set null' }),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  category: text("category").notNull(),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventCategories = pgTable("event_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").references(() => couples.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertCoupleSchema = createInsertSchema(couples).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeddingInfoSchema = createInsertSchema(weddingInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueQuoteSchema = createInsertSchema(venueQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
});

export const insertGroupGuestSchema = createInsertSchema(groupGuests).omit({
  id: true,
  createdAt: true,
});

export const insertSharedNoteSchema = createInsertSchema(sharedNotes).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEventCategorySchema = createInsertSchema(eventCategories).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertCouple = z.infer<typeof insertCoupleSchema>;
export type Couple = typeof couples.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettings.$inferSelect;

export type InsertWeddingInfo = z.infer<typeof insertWeddingInfoSchema>;
export type WeddingInfo = typeof weddingInfo.$inferSelect;

export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;

export type InsertVenueQuote = z.infer<typeof insertVenueQuoteSchema>;
export type VenueQuote = typeof venueQuotes.$inferSelect;

export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;

export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;

export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guests.$inferSelect;

export type InsertGroupGuest = z.infer<typeof insertGroupGuestSchema>;
export type GroupGuest = typeof groupGuests.$inferSelect;

export type InsertSharedNote = z.infer<typeof insertSharedNoteSchema>;
export type SharedNote = typeof sharedNotes.$inferSelect;

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export type InsertEventCategory = z.infer<typeof insertEventCategorySchema>;
export type EventCategory = typeof eventCategories.$inferSelect;
