import { 
  type PomodoroSession, 
  type InsertPomodoroSession,
  type PomodoroSettings,
  type InsertPomodoroSettings,
  type StreakData,
  type InsertStreakData,
  type User,
  type InsertUser,
  users,
  pomodoroSessions,
  pomodoroSettings,
  streakData
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPomodoroSession(id: string): Promise<PomodoroSession | undefined>;
  getSessionsForUser(userId: string): Promise<PomodoroSession[]>;
  createSession(userId: string, session: InsertPomodoroSession): Promise<PomodoroSession>;

  getSettings(userId: string): Promise<PomodoroSettings | undefined>;
  createSettings(userId: string, settings: InsertPomodoroSettings): Promise<PomodoroSettings>;
  updateSettings(userId: string, updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined>;

  getStreakData(userId: string): Promise<StreakData | undefined>;
  createStreakData(userId: string, streak: InsertStreakData): Promise<StreakData>;
  updateStreakData(userId: string, updates: Partial<StreakData>): Promise<StreakData | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getPomodoroSession(id: string) {
    const [session] = await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.id, id));
    return session;
  }

  async getSessionsForUser(userId: string) {
    return await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
  }

  async createSession(userId: string, data: InsertPomodoroSession) {
    const [session] = await db.insert(pomodoroSessions).values({
      ...data,
      userId,
    }).returning();
    return session;
  }

  async getSettings(userId: string) {
    const [settings] = await db.select().from(pomodoroSettings).where(eq(pomodoroSettings.userId, userId));
    return settings;
  }

  async createSettings(userId: string, data: InsertPomodoroSettings) {
    const [settings] = await db.insert(pomodoroSettings).values({
      ...data,
      userId,
    }).returning();
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<PomodoroSettings>) {
    const [settings] = await db
      .update(pomodoroSettings)
      .set(updates)
      .where(eq(pomodoroSettings.userId, userId))
      .returning();
    return settings;
  }

  async getStreakData(userId: string) {
    const [streak] = await db.select().from(streakData).where(eq(streakData.userId, userId));
    return streak;
  }

  async createStreakData(userId: string, data: InsertStreakData) {
    const [streak] = await db.insert(streakData).values({
      ...data,
      userId,
    }).returning();
    return streak;
  }

  async updateStreakData(userId: string, updates: Partial<StreakData>) {
    const [streak] = await db
      .update(streakData)
      .set(updates)
      .where(eq(streakData.userId, userId))
      .returning();
    return streak;
  }
}

export const storage = new DatabaseStorage();
