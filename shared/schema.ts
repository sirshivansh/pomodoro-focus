import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pomodoro session tracking
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "work", "short-break", "long-break"
  duration: integer("duration").notNull(), // in seconds
  completed: boolean("completed").notNull().default(false),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
});

// User settings for timer customization  
export const pomodoroSettings = pgTable("pomodoro_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workDuration: integer("work_duration").notNull().default(1500), // 25 minutes in seconds
  shortBreakDuration: integer("short_break_duration").notNull().default(300), // 5 minutes
  longBreakDuration: integer("long_break_duration").notNull().default(900), // 15 minutes
  sessionsUntilLongBreak: integer("sessions_until_long_break").notNull().default(4),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
});

// Streak tracking for motivation
export const streakData = pgTable("streak_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastSessionDate: timestamp("last_session_date"),
  totalSessions: integer("total_sessions").notNull().default(0),
});

// Zod schemas for validation
export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  endTime: true,
});

export const insertPomodoroSettingsSchema = createInsertSchema(pomodoroSettings).omit({
  id: true,
});

export const insertStreakDataSchema = createInsertSchema(streakData).omit({
  id: true,
});

// Types
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
}

export interface TimerData {
  timeRemaining: number;
  totalTime: number;
  currentSession: SessionType;
  sessionsCompleted: number;
  state: TimerState;
}