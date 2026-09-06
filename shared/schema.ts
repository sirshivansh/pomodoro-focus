import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

// Pomodoro session tracking
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "work", "short-break", "long-break"
  duration: integer("duration").notNull(), // in seconds
  completed: boolean("completed").notNull().default(false),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
});

// User settings for timer customization  
export const pomodoroSettings = pgTable("pomodoro_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  workDuration: integer("work_duration").notNull().default(1500), // 25 minutes in seconds
  shortBreakDuration: integer("short_break_duration").notNull().default(300), // 5 minutes
  longBreakDuration: integer("long_break_duration").notNull().default(900), // 15 minutes
  sessionsUntilLongBreak: integer("sessions_until_long_break").notNull().default(4),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
});

// Streak tracking for motivation
export const streakData = pgTable("streak_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastSessionDate: timestamp("last_session_date"),
  totalSessions: integer("total_sessions").notNull().default(0),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  endTime: true,
  userId: true, // we handle this on the server
});

export const insertPomodoroSettingsSchema = createInsertSchema(pomodoroSettings).omit({
  id: true,
  userId: true,
});

export const insertStreakDataSchema = createInsertSchema(streakData).omit({
  id: true,
  userId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;

export type InsertPomodoroSettings = z.infer<typeof insertPomodoroSettingsSchema>;
export type PomodoroSettings = typeof pomodoroSettings.$inferSelect;

export type InsertStreakData = z.infer<typeof insertStreakDataSchema>;
export type StreakData = typeof streakData.$inferSelect;

// Client-only types for timer state
export type TimerState = "idle" | "running" | "paused";
export type SessionType = "work" | "short-break" | "long-break";

export interface TimerConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  autoStart: boolean;
  notificationsEnabled: boolean;
}

export interface TimerData {
  timeRemaining: number;
  totalTime: number;
  currentSession: SessionType;
  sessionsCompleted: number;
  state: TimerState;
}