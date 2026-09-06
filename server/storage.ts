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
import crypto from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setResetToken(email: string, token: string | null, expiry: Date | null): Promise<User | undefined>;
  updatePassword(userId: string, hashedPassword: string): Promise<User | undefined>;

  getPomodoroSession(id: string): Promise<PomodoroSession | undefined>;
  getSessionsForUser(userId: string): Promise<PomodoroSession[]>;
  createSession(userId: string, session: InsertPomodoroSession): Promise<PomodoroSession>;
  clearSessions(userId: string): Promise<void>;

  getSettings(userId: string): Promise<PomodoroSettings | undefined>;
  createSettings(userId: string, settings: InsertPomodoroSettings): Promise<PomodoroSettings>;
  updateSettings(userId: string, updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined>;

  getStreakData(userId: string): Promise<StreakData | undefined>;
  createStreakData(userId: string, streak: InsertStreakData): Promise<StreakData>;
  updateStreakData(userId: string, updates: Partial<StreakData>): Promise<StreakData | undefined>;
  updateSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | undefined>;
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

  async getUserByResetToken(token: string) {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async setResetToken(email: string, token: string | null, expiry: Date | null) {
    const [updated] = await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.email, email))
      .returning();
    return updated;
  }

  async updatePassword(userId: string, hashedPassword: string) {
    const [updated] = await db
      .update(users)
      .set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getPomodoroSession(id: string) {
    const [session] = await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.id, id));
    return session;
  }

  async getSessionsForUser(userId: string) {
    return await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
  }

  async createSession(userId: string, data: InsertPomodoroSession) {
    const sessionToInsert: any = {
      ...data,
      userId,
      startTime: new Date(data.startTime),
    };
    
    if ((data as any).endTime) {
      sessionToInsert.endTime = new Date((data as any).endTime);
    }

    const [session] = await db.insert(pomodoroSessions).values(sessionToInsert).returning();
    return session;
  }

  async clearSessions(userId: string) {
    await db.delete(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
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

  async updateSession(id: string, updates: Partial<PomodoroSession>) {
    const sessionUpdates: any = { ...updates };
    if (updates.startTime) sessionUpdates.startTime = new Date(updates.startTime);
    if (updates.endTime) sessionUpdates.endTime = new Date(updates.endTime);

    const [updated] = await db
      .update(pomodoroSessions)
      .set(sessionUpdates)
      .where(eq(pomodoroSessions.id, id))
      .returning();
    return updated;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, PomodoroSession>;
  private settings: Map<string, PomodoroSettings>;
  private streaks: Map<string, StreakData>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.settings = new Map();
    this.streaks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = {
      ...insertUser,
      id,
      resetToken: null,
      resetTokenExpiry: null,
    };
    this.users.set(id, user);
    return user;
  }

  async setResetToken(email: string, token: string | null, expiry: Date | null): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(user.id, user);
    return user;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    this.users.set(user.id, user);
    return user;
  }

  async getPomodoroSession(id: string): Promise<PomodoroSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsForUser(userId: string): Promise<PomodoroSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }

  async createSession(userId: string, data: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = crypto.randomUUID();
    const session: PomodoroSession = {
      id,
      userId,
      type: data.type,
      taskTag: data.taskTag ?? null,
      duration: data.duration,
      completed: data.completed ?? false,
      startTime: new Date(data.startTime),
      endTime: (data as any).endTime ? new Date((data as any).endTime) : null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async clearSessions(userId: string): Promise<void> {
    this.sessions.forEach((s, id) => {
      if (s.userId === userId) {
        this.sessions.delete(id);
      }
    });
  }

  async getSettings(userId: string): Promise<PomodoroSettings | undefined> {
    return Array.from(this.settings.values()).find((s) => s.userId === userId);
  }

  async createSettings(userId: string, data: InsertPomodoroSettings): Promise<PomodoroSettings> {
    const id = crypto.randomUUID();
    const settings: PomodoroSettings = {
      id,
      userId,
      workDuration: data.workDuration ?? 1500,
      shortBreakDuration: data.shortBreakDuration ?? 300,
      longBreakDuration: data.longBreakDuration ?? 900,
      sessionsUntilLongBreak: data.sessionsUntilLongBreak ?? 4,
      soundEnabled: data.soundEnabled ?? true,
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined> {
    let settings = await this.getSettings(userId);
    if (!settings) {
      settings = await this.createSettings(userId, updates as any);
    } else {
      Object.assign(settings, updates);
      this.settings.set(settings.id, settings);
    }
    return settings;
  }

  async getStreakData(userId: string): Promise<StreakData | undefined> {
    return Array.from(this.streaks.values()).find((s) => s.userId === userId);
  }

  async createStreakData(userId: string, data: InsertStreakData): Promise<StreakData> {
    const id = crypto.randomUUID();
    const streak: StreakData = {
      id,
      userId,
      currentStreak: data.currentStreak ?? 0,
      longestStreak: data.longestStreak ?? 0,
      lastSessionDate: data.lastSessionDate ? new Date(data.lastSessionDate) : null,
      totalSessions: data.totalSessions ?? 0,
    };
    this.streaks.set(id, streak);
    return streak;
  }

  async updateStreakData(userId: string, updates: Partial<StreakData>): Promise<StreakData | undefined> {
    let streak = await this.getStreakData(userId);
    if (!streak) {
      streak = await this.createStreakData(userId, updates as any);
    } else {
      Object.assign(streak, updates);
      this.streaks.set(streak.id, streak);
    }
    return streak;
  }

  async updateSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    Object.assign(session, updates);
    if (updates.startTime) session.startTime = new Date(updates.startTime);
    if (updates.endTime) session.endTime = new Date(updates.endTime);
    this.sessions.set(id, session);
    return session;
  }
}

export class FallbackStorage implements IStorage {
  private dbStorage: DatabaseStorage;
  private memStorage: MemStorage;
  private useMemory: boolean = false;

  constructor() {
    this.dbStorage = new DatabaseStorage();
    this.memStorage = new MemStorage();
  }

  private async execute<T>(fn: (s: IStorage) => Promise<T>): Promise<T> {
    if (this.useMemory) {
      return fn(this.memStorage);
    }
    try {
      return await fn(this.dbStorage);
    } catch (err: any) {
      console.warn("[STORAGE] Database operation failed, falling back to in-memory storage:", err.message || err);
      this.useMemory = true;
      return fn(this.memStorage);
    }
  }

  getUser(id: string) { return this.execute(s => s.getUser(id)); }
  getUserByEmail(email: string) { return this.execute(s => s.getUserByEmail(email)); }
  getUserByResetToken(token: string) { return this.execute(s => s.getUserByResetToken(token)); }
  createUser(user: InsertUser) { return this.execute(s => s.createUser(user)); }
  setResetToken(email: string, token: string | null, expiry: Date | null) { return this.execute(s => s.setResetToken(email, token, expiry)); }
  updatePassword(userId: string, hashedPassword: string) { return this.execute(s => s.updatePassword(userId, hashedPassword)); }

  getPomodoroSession(id: string) { return this.execute(s => s.getPomodoroSession(id)); }
  getSessionsForUser(userId: string) { return this.execute(s => s.getSessionsForUser(userId)); }
  createSession(userId: string, session: InsertPomodoroSession) { return this.execute(s => s.createSession(userId, session)); }
  clearSessions(userId: string) { return this.execute(s => s.clearSessions(userId)); }

  getSettings(userId: string) { return this.execute(s => s.getSettings(userId)); }
  createSettings(userId: string, settings: InsertPomodoroSettings) { return this.execute(s => s.createSettings(userId, settings)); }
  updateSettings(userId: string, updates: Partial<PomodoroSettings>) { return this.execute(s => s.updateSettings(userId, updates)); }

  getStreakData(userId: string) { return this.execute(s => s.getStreakData(userId)); }
  createStreakData(userId: string, streak: InsertStreakData) { return this.execute(s => s.createStreakData(userId, streak)); }
  updateStreakData(userId: string, updates: Partial<StreakData>) { return this.execute(s => s.updateStreakData(userId, updates)); }
  updateSession(id: string, updates: Partial<PomodoroSession>) { return this.execute(s => s.updateSession(id, updates)); }
}

export const storage = new FallbackStorage();
