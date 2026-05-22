import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["author", "admin"]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);
export const ticketCategoryEnum = pgEnum("ticket_category", [
  "royalty_payments",
  "isbn_metadata",
  "printing_quality",
  "distribution_availability",
  "book_status_production",
  "general_inquiry",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const authors = pgTable("authors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  joinedDate: date("joined_date").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  authorId: text("author_id").references(() => authors.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => authors.id),
  title: text("title").notNull(),
  isbn: text("isbn").notNull(),
  genre: text("genre").notNull(),
  publicationDate: date("publication_date"),
  status: text("status").notNull(),
  mrp: integer("mrp"),
  authorRoyaltyPerCopy: integer("author_royalty_per_copy"),
  totalCopiesSold: integer("total_copies_sold").default(0).notNull(),
  totalRoyaltyEarned: integer("total_royalty_earned").default(0).notNull(),
  royaltyPaid: integer("royalty_paid").default(0).notNull(),
  royaltyPending: integer("royalty_pending").default(0).notNull(),
  lastRoyaltyPayoutDate: date("last_royalty_payout_date"),
  printPartner: text("print_partner"),
  availableOn: text("available_on")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => authors.id),
  bookId: text("book_id").references(() => books.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default("open").notNull(),
  category: ticketCategoryEnum("category"),
  priority: ticketPriorityEnum("priority"),
  assignedTo: text("assigned_to"),
  aiCategorySuggestion: text("ai_category_suggestion"),
  aiPrioritySuggestion: text("ai_priority_suggestion"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ticketResponses = pgTable("ticket_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id),
  author: text("author").notNull(),
  content: text("content").notNull(),
  isInternalNote: boolean("is_internal_note").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
  tickets: many(tickets),
  users: many(users),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  author: one(authors, {
    fields: [tickets.authorId],
    references: [authors.id],
  }),
  book: one(books, {
    fields: [tickets.bookId],
    references: [books.id],
  }),
  responses: many(ticketResponses),
}));

export const ticketResponsesRelations = relations(ticketResponses, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketResponses.ticketId],
    references: [tickets.id],
  }),
}));

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type TicketCategory = (typeof ticketCategoryEnum.enumValues)[number];
export type TicketPriority = (typeof ticketPriorityEnum.enumValues)[number];
export type Book = typeof books.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketResponse = typeof ticketResponses.$inferSelect;
