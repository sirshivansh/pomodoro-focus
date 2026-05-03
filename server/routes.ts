import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  // --- Pomodoro Sessions ---
  app.get("/api/sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const sessions = await storage.getSessionsForUser(user.id);
    res.json(sessions);
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const session = await storage.createSession(user.id, req.body);
    res.status(201).json(session);
  });

  // --- Settings ---
  app.get("/api/settings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const settings = await storage.getSettings(user.id);
    res.json(settings || {});
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getSettings(user.id);
    let settings;
    if (existing) {
      settings = await storage.updateSettings(user.id, req.body);
    } else {
      settings = await storage.createSettings(user.id, req.body);
    }
    res.json(settings);
  });

  // --- Streak Data ---
  app.get("/api/streak", requireAuth, async (req, res) => {
    const user = req.user as User;
    const streak = await storage.getStreakData(user.id);
    res.json(streak || {});
  });

  app.post("/api/streak", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getStreakData(user.id);
    let streak;
    if (existing) {
      streak = await storage.updateStreakData(user.id, req.body);
    } else {
      streak = await storage.createStreakData(user.id, req.body);
    }
    res.json(streak);
  });

  const httpServer = createServer(app);
  return httpServer;
}
