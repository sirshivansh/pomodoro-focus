import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import MemoryStoreFactory from "memorystore";
import pg from "pg";
import { db } from "./db";
import { sendPasswordResetEmail } from "./email";

const scryptAsync = promisify(scrypt);
const PostgresStore = connectPg(session);
const MemoryStore = MemoryStoreFactory(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  let store: any;
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
      store = new PostgresStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
      });
    } else {
      store = new MemoryStore({ checkPeriod: 86400000 });
    }
  } catch (e) {
    store = new MemoryStore({ checkPeriod: 86400000 });
  }

  if (!store) {
    store = new MemoryStore({ checkPeriod: 86400000 });
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pomodoro_secret",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
    },
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SelectUser).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, email: user.email });
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ id: user.id, email: user.email });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as SelectUser;
    res.json({ id: user.id, email: user.email });
  });

  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      console.log(`[AUTH API] Forgot password request received for: "${email}"`);
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      console.log(`[AUTH API] User lookup result:`, user ? `Found user (id: ${user.id}, email: ${user.email})` : "User NOT FOUND");

      if (!user) {
        return res.status(200).json({ 
          message: "If an account exists with that email, a password reset code has been sent to your inbox."
        });
      }

      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setResetToken(user.email, token, expiry);
      console.log(`[AUTH API] Set reset token "${token}" for email "${user.email}"`);

      // Send email safely
      console.log(`[AUTH API] Triggering sendPasswordResetEmail...`);
      const sent = await sendPasswordResetEmail(user.email, token);
      console.log(`[AUTH API] sendPasswordResetEmail completed with status: ${sent}`);

      // Return sanitized response with NO sensitive reset token in JSON
      res.status(200).json({
        message: "If an account exists with that email, a password reset code has been sent to your inbox."
      });
    } catch (err) {
      console.error(`[AUTH API ERROR]:`, err);
      next(err);
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Reset code and new password are required" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry) {
        return res.status(400).json({ message: "Invalid reset code" });
      }

      if (new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Reset code has expired" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updatePassword(user.id, hashedPassword);

      console.log(`[AUTH] Password updated successfully for user ${user.email}`);

      res.status(200).json({ message: "Password updated successfully. You can now sign in." });
    } catch (err) {
      next(err);
    }
  });
}
