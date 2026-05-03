import { 
  type PomodoroSession, 
  type InsertPomodoroSession,
  type PomodoroSettings,
  type InsertPomodoroSettings,
  type StreakData,
  type InsertStreakData
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPomodoroSession(id: string): Promise<PomodoroSession | undefined>;
  getAllSessions(): Promise<PomodoroSession[]>;
  createSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updateSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | undefined>;
  getSettings(): Promise<PomodoroSettings | undefined>;
  createSettings(settings: InsertPomodoroSettings): Promise<PomodoroSettings>;
  updateSettings(updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined>;
  getStreakData(): Promise<StreakData | undefined>;
  createStreakData(streak: InsertStreakData): Promise<StreakData>;
  updateStreakData(updates: Partial<StreakData>): Promise<StreakData | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, PomodoroSession> = new Map();
  private settings: PomodoroSettings | undefined;
  private streak: StreakData | undefined;

  async getPomodoroSession(id: string) { return this.sessions.get(id); }
  async getAllSessions() { return Array.from(this.sessions.values()); }

  async createSession(data: InsertPomodoroSession): Promise<PomodoroSession> {
    const session: PomodoroSession = {
      id: randomUUID(),
      type: data.type,
      duration: data.duration,
      completed: data.completed ?? false,
      startTime: data.startTime,
      endTime: null,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<PomodoroSession>) {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async getSettings() { return this.settings; }

  async createSettings(data: InsertPomodoroSettings): Promise<PomodoroSettings> {
    this.settings = {
      id: randomUUID(),
      workDuration: data.workDuration ?? 1500,
      shortBreakDuration: data.shortBreakDuration ?? 300,
      longBreakDuration: data.longBreakDuration ?? 900,
      sessionsUntilLongBreak: data.sessionsUntilLongBreak ?? 4,
      soundEnabled: data.soundEnabled ?? true,
    };
    return this.settings;
  }

  async updateSettings(updates: Partial<PomodoroSettings>) {
    if (!this.settings) return undefined;
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  async getStreakData() { return this.streak; }

  async createStreakData(data: InsertStreakData): Promise<StreakData> {
    this.streak = {
      id: randomUUID(),
      currentStreak: data.currentStreak ?? 0,
      longestStreak: data.longestStreak ?? 0,
      lastSessionDate: data.lastSessionDate ?? null,
      totalSessions: data.totalSessions ?? 0,
    };
    return this.streak;
  }

  async updateStreakData(updates: Partial<StreakData>) {
    if (!this.streak) return undefined;
    this.streak = { ...this.streak, ...updates };
    return this.streak;
  }
}

export const storage = new MemStorage();
