# PomoFocusTrack 🍅

[![Live Site](https://img.shields.io/badge/Live_App-pomodoro--focus.onrender.com-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://pomodoro-focus.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3.4-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**PomoFocusTrack** is a production-grade, cloud-synchronized Pomodoro productivity suite. Built with an agency-grade design philosophy, it bridges the gap between high-end aesthetic beauty and high-performance focus tools.

🚀 **Live Application**: [https://pomodoro-focus.onrender.com](https://pomodoro-focus.onrender.com)

---

## 🌟 What's New in v1.6.0

### 🌌 Spline 3D Backlight & 60FPS Ambient Backlight Engine
- **Spline 3D Viewport Background**: Embedded Spline 3D red grid backlight scene (`https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/`) as a full-bleed background with soft radial vignetting.
- **Ultra-Smooth 60FPS GPU Mode**: Added a hardware-accelerated CSS 3D GPU Grid engine running at native 60–120 FPS with 0% CPU overhead to eliminate WebGL lag on any device.
- **Interactive Control Popover**: Sleek Sparkles icon button in the navigation sidebar allowing users to toggle 3D background ON/OFF, adjust glow intensity (10% - 100%), and switch engine modes (`Ultra 60FPS` vs `Spline 3D`). Saved to `localStorage`.

### 🔐 Password Reset & Resend Email Integration
- **Transactional Password Reset**: Request a 6-digit verification code sent directly to your inbox using the Resend API or generic SMTP fallback.
- **Resilient Authentication Handling**: Improved Passport.js session deserialization (`deserializeUser`) to handle stale browser cookies gracefully without `502 Bad Gateway` errors.

### 📱 Adaptive 100vh Layout & Glassmorphism Design
- **Responsive Screen Adaptation**: Auto-fitting responsive layout designed to fit within 100vh on any display resolution (laptops, monitors, 4K displays).
- **Hidden Scrollbars**: Eliminated ugly browser vertical scrollbar tracks (`no-scrollbar`) for an ultra-clean presentation.
- **Glassmorphism Overlays**: Translucent backdrop blur (`backdrop-blur-md bg-[#0f1019]/80 border-[#1e1f2b]/80`) on timer cards, widget header, and stats grids.

---

## ✨ Core Features

- ☁️ **Cloud Synchronization**: Every focus session, streak, and achievement is saved to a serverless PostgreSQL database (Neon).
- 🔐 **Secure Authentication**: Robust session-based auth powered by Passport.js and secure cookie management.
- 🪟 **Mini-Window Mode**: Pop out a compact, content-only timer window (`/mini`) that stays on top of your desktop workflow.
- 📡 **Real-Time Cross-Window Sync**: Instant multi-tab and mini-window synchronization via the BroadcastChannel API.
- 📊 **Productivity Intelligence**: GitHub-style weekly heatmaps, focus streak counters, and daily pomodoro goal progress.
- 🏆 **Gamified Achievements**: Unlock achievement badges (Novice, Scholar, Deep Work Master, Zenith) with milestone share cards.
- 🎙️ **Audio & Voice Announcements**: Synthetic startup chimes and AI voice notifications keep you informed hands-free.

---

## 📁 Project Architecture & Clean Structure

```text
PomoFocusTrack/
├── assets/                     # UI screenshots, mockups & image attachments
│   ├── attached/               # User uploaded documentation assets
│   └── *.png                   # High-fidelity dashboard mockups
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── public/                 # Static web assets (favicon, docs.html)
│   └── src/
│       ├── components/         # Timer, Analytics, SplineBackground, SplineControls, Stats
│       ├── hooks/              # useAuth, useSessions, useToast hooks
│       ├── lib/                # React Query client & utility helpers
│       ├── pages/              # Home, AuthPage, MiniTimer, NotFound
│       └── index.css           # Design tokens, Tailwind utilities & animations
├── docs/                       # Project specifications & superpower design docs
│   └── superpowers/specs/      # Detailed technical specs (Spline 3D design, etc.)
├── server/                     # Backend API & Server (Node.js + Express)
│   ├── auth.ts                 # Passport.js local strategy & session serialization
│   ├── db.ts                   # Neon PostgreSQL connection client
│   ├── email.ts                # Resend API & Nodemailer password reset service
│   ├── routes.ts               # REST API endpoints (/api/sessions, /api/auth)
│   ├── storage.ts              # Database access layer (Drizzle ORM)
│   └── index.ts                # Express server entry point & static asset server
├── shared/                     # Shared TypeScript Schemas & Zod Validators
│   └── schema.ts               # Database tables (users, pomodoro_sessions, settings)
└── dist/                       # Production bundle output (vite build + esbuild)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, TanStack Query v5, Wouter, Lucide Icons |
| **Backend** | Node.js, Express, Passport.js, Zod, express-session, Connect-PG-Simple |
| **Database** | Neon PostgreSQL (Serverless), Drizzle ORM |
| **Integrations**| Resend API (Emails), Spline 3D WebGL, BroadcastChannel API, Web Audio API |

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **npm** / **pnpm** / **yarn**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sirshivansh/pomodoro-focus.git
   cd PomoFocusTrack
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
   SESSION_SECRET=your_super_secret_session_key
   RESEND_API_KEY=re_your_resend_api_key_here
   FROM_EMAIL=onboarding@resend.dev
   ```

4. **Initialize Database Schema**:
   ```bash
   npm run db:push
   ```

### Running Locally

```bash
# Start full-stack development server (Express + Vite hot reload)
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🚢 Production Deployment (Render)

This project is configured for one-click automatic deployment on **Render**.

1. **Build Command**: `npm run build`
2. **Start Command**: `npm run start`
3. **Environment Variables**:
   - `DATABASE_URL`: Neon PostgreSQL connection URI
   - `SESSION_SECRET`: Session secret key
   - `RESEND_API_KEY`: Resend API key for emails

The build script compiles the client app into `dist/public` and bundles the Node server into `dist/index.js`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

<div align="center">
  <br/>
  <p>Built with precision for the modern focus enthusiast.</p>
  <strong>POMOFOCUS TRACK</strong>
</div>
