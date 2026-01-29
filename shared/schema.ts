import { pgTable, text, serial, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  protocol: varchar("protocol", { length: 20 }).notNull().unique(),
  type: text("type", { enum: ["text", "audio", "image", "video"] }).notNull(),
  content: text("content"), // For text description or metadata about the file
  mediaUrl: text("media_url"), // For simulated file path/url
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status", { enum: ["received", "processing", "completed"] }).default("received").notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  status: true,
  protocol: true, // Protocol is generated server-side
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
