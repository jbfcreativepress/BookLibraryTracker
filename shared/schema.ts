import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  yearRead: integer("year_read"),
  rating: integer("rating"),
  notes: text("notes"),
  coverUrl: text("cover_url"),
  coverData: text("cover_data"),
  isbn: text("isbn"),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  yearRead: true,
  rating: true,
  notes: true,
  coverUrl: true,
  coverData: true,
  isbn: true,
  publisher: true,
  publishedDate: true,
  description: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
