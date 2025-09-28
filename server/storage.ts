import { 
  type PomodoroSession, 
  type InsertPomodoroSession,
  type PomodoroSettings,
  type InsertPomodoroSettings,
  type StreakData,
  type InsertStreakData
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for Pomodoro app data
export interface IStorage {
  // Sessions
  getPomodoroSession(id: string): Promise<PomodoroSession | undefined>;
  getAllSessions(): Promise<PomodoroSession[]>;
  createSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updateSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | undefined>;
  
  // Settings
  getSettings(): Promise<PomodoroSettings | undefined>;
  createSettings(settings: InsertPomodoroSettings): Promise<PomodoroSettings>;
  updateSettings(updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined>;
  
  // Streaks
  getStreakData(): Promise<StreakData | undefined>;
  createStreakData(streak: InsertStreakData): Promise<StreakData>;
  updateStreakData(updates: Partial<StreakData>): Promise<StreakData | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, PomodoroSession>;
  private settings: PomodoroSettings | undefined;
  private streakData: StreakData | undefined;

  constructor() {
    this.sessions = new Map();
  }

  // Session methods
  async getPomodoroSession(id: string): Promise<PomodoroSession | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<PomodoroSession[]> {
    return Array.from(this.sessions.values());
  }

  async createSession(insertSession: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = randomUUID();
    const session: PomodoroSession = { ...insertSession, id, endTime: null };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Settings methods
  async getSettings(): Promise<PomodoroSettings | undefined> {
    return this.settings;
  }

  async createSettings(insertSettings: InsertPomodoroSettings): Promise<PomodoroSettings> {
    const id = randomUUID();
    this.settings = { ...insertSettings, id };
    return this.settings;
  }

  async updateSettings(updates: Partial<PomodoroSettings>): Promise<PomodoroSettings | undefined> {
    if (!this.settings) return undefined;
    
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  // Streak methods
  async getStreakData(): Promise<StreakData | undefined> {
    return this.streakData;
  }

  async createStreakData(insertStreak: InsertStreakData): Promise<StreakData> {
    const id = randomUUID();
    this.streakData = { ...insertStreak, id };
    return this.streakData;
  }

  async updateStreakData(updates: Partial<StreakData>): Promise<StreakData | undefined> {
    if (!this.streakData) return undefined;
    
    this.streakData = { ...this.streakData, ...updates };
    return this.streakData;
  }
}

export const storage = new MemStorage();
