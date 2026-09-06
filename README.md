<div align="center">

# 🍅 PomoFocusTrack

### *Next-Gen 3D Ambient Pomodoro Focus & Productivity Intelligence Suite*

[![Live App](https://img.shields.io/badge/Live_App-pomodoro--focus.onrender.com-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://pomodoro-focus.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3.4-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Spline 3D](https://img.shields.io/badge/Spline_3D-WebGL-ff4081.svg?style=for-the-badge&logo=spline)](https://spline.design/)

**PomoFocusTrack** is a production-grade, cloud-synchronized Pomodoro productivity suite. Engineered with an agency-grade design philosophy, it bridges the gap between high-end aesthetic beauty and high-performance focus tools.

🚀 **Live Production Application**: [https://pomodoro-focus.onrender.com](https://pomodoro-focus.onrender.com)

---

### 🖥️ Main Dashboard Overview
![PomoFocusTrack Hero Dashboard](assets/pomofocus_hero_dashboard.png)
*Figure 1: Full-bleed main Pomodoro focus interface featuring 3D glowing red grid backlight, circular progress indicator, task tag presets, live streak counter, and current session progress.*

</div>

---

## 🌟 What's New in v1.6.0

### 🌌 Spline 3D & 60FPS Ambient Backlight Engine
- **Spline 3D Viewport Background**: Integrated Spline 3D red grid backlight scene (`https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/`) as a full-bleed viewport canvas with radial vignetting.
- **Hardware-Accelerated 60FPS Mode**: Fallback CSS 3D GPU Grid engine running at native 60–120 FPS with 0% CPU overhead to ensure ultra-smooth performance on any mobile device or low-spec hardware.
- **Interactive Backlight Popover**: Dedicated Sparkles control drawer in the navigation sidebar allowing users to toggle 3D background ON/OFF, adjust backlight glow intensity (10%–100%), and switch engine modes (`Ultra 60FPS` vs `Spline 3D`).

### 🔐 Password Reset & Resend Email Integration
- **Transactional Password Recovery**: Request a secure 6-digit verification code sent directly to your inbox via the Resend API or generic SMTP fallback.
- **Resilient Auth Handling**: Hardened Passport.js session deserialization (`deserializeUser`) to handle stale browser cookies gracefully without server drops or `502 Bad Gateway` errors.

### 📱 Adaptive 100vh Layout & Glassmorphism Design System
- **Single-Screen Responsiveness**: Auto-fitting layout engineered to fit within `100vh` on standard laptops, desktop monitors, and 4K displays.
- **Zero Scrollbar Distractions**: Hidden scrollbar tracks (`no-scrollbar`) for an immersive presentation.
- **Translucent Backdrop Blur**: Layered glassmorphism overlays (`backdrop-blur-md bg-[#0f1019]/80 border-[#1e1f2b]/80`) across timer cards, header widgets, and statistics grids.

---

## 📸 High-Resolution Visual Tour

### ⏱️ Session Modes & Custom Glow Themes
Track deep work, short breaks, and long breaks with dynamic ambient lighting transitions.

| **Short Break Mode (Teal Glow)** | **Long Break Mode (Amber Glow)** |
| :---: | :---: |
| ![Short Break Mode](assets/pomofocus_short_break.png) | ![Long Break Mode](assets/pomofocus_long_break.png) |
| *Teal ambient lighting during 5-minute break sessions* | *Warm amber lighting during 15-minute long break sessions* |

---

### 🎛️ 3D Backlight Controls & PRODUCTIVE+ Analytics

| **Spline 3D Backlight Controls** | **Productivity Intelligence & Heatmap** |
| :---: | :---: |
| ![3D Spline Controls Popover](assets/pomofocus_spline_controls.png) | ![Analytics Dashboard](assets/pomofocus_analytics_dashboard.png) |
| *Adjust glow intensity and toggle between 60FPS GPU & Spline 3D* | *GitHub-style weekly contribution heatmaps & focus logs* |

---

### 🏆 Achievements, Settings & Desktop Mini-Window

| **Streaks & Achievement Badges** | **Timer Settings Drawer** |
| :---: | :---: |
| ![Achievements and Badges Panel](assets/pomofocus_achievements_badges.png) | ![Timer Settings Panel](assets/pomofocus_settings_panel.png) |
| *Unlockable milestone badges (Novice, Scholar, Zenith)* | *Configure work durations, chimes, and auto-start rules* |

<br/>

<div align="center">

| **Desktop Pop-Out Mini Timer (`/mini`)** | **Transactional Authentication Portal** |
| :---: | :---: |
| <img src="assets/pomofocus_mini_timer.png" width="340" alt="Mini Window Timer"/> | <img src="assets/pomofocus_auth_login.png" width="480" alt="Auth Portal"/> |
| *Compact, always-on-top floating timer window for desktop workflows* | *Secure login, signup, and transactional password reset interface* |

</div>

---

## ✨ Core Features

- ☁️ **Cloud Synchronization**: Every focus session, streak counter, and achievement milestone is persisted to a serverless PostgreSQL database (Neon).
- 🔐 **Secure Session Auth**: Passport.js session-based authentication backed by `connect-pg-simple` and encrypted cookies.
- 🪟 **Desktop Mini-Window Mode**: Pop out a compact, content-only timer window (`/mini`) that stays alongside your code editor or notes.
- 📡 **Real-Time Cross-Window Sync**: Instant multi-tab state synchronization via the native BroadcastChannel API.
- 📊 **Productivity Intelligence**: GitHub-style activity heatmaps, streak maintenance, daily goal progress, and session breakdown charts.
- 🏆 **Gamified Achievements**: Milestone badges (Novice, Scholar, Deep Work Master, Zenith) with unlock notifications and share cards.
- 🎙️ **Synthesized Audio Announcements**: Customizable startup chimes and web speech audio feedback for hands-free productivity.

---

## 📁 Project Architecture & Clean Structure

```text
PomoFocusTrack/
├── assets/                     # HD Application screenshots & UI mockups
│   ├── pomofocus_hero_dashboard.png
│   ├── pomofocus_short_break.png
│   ├── pomofocus_long_break.png
│   ├── pomofocus_spline_controls.png
│   ├── pomofocus_analytics_dashboard.png
│   ├── pomofocus_achievements_badges.png
│   ├── pomofocus_settings_panel.png
│   ├── pomofocus_mini_timer.png
│   └── pomofocus_auth_login.png
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── public/                 # Static assets (favicon, docs.html)
│   └── src/
│       ├── components/         # Timer, Analytics, SplineBackground, SplineControls, Stats, Badges
│       ├── hooks/              # useAuth, useSessions, useToast hooks
│       ├── lib/                # React Query client & utility helpers
│       ├── pages/              # Home, AuthPage, MiniTimer, NotFound
│       └── index.css           # Design tokens, Tailwind utilities & custom keyframe animations
├── docs/                       # Project specifications & design docs
│   └── superpowers/specs/      # Spline 3D background technical specifications
├── server/                     # Backend API & Express Server
│   ├── auth.ts                 # Passport.js strategy & session handling
│   ├── db.ts                   # Neon PostgreSQL connection client
│   ├── email.ts                # Resend API & Nodemailer password reset service
│   ├── routes.ts               # REST API endpoints (/api/sessions, /api/auth)
│   ├── storage.ts              # Database access layer (Drizzle ORM)
│   └── index.ts                # Express entry point & static file server
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
- **Node.js**: v20.0.0 or higher
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

## 🚢 Production Deployment

This application is ready for one-click automatic deployment on **Render** or **Vercel / Railway**.

1. **Build Command**: `npm run build`
2. **Start Command**: `npm run start`
3. **Required Environment Variables**:
   - `DATABASE_URL`: Neon PostgreSQL connection URI
   - `SESSION_SECRET`: Session secret key
   - `RESEND_API_KEY`: Resend API key for emails

The build pipeline compiles the frontend bundle into `dist/public` and bundles the backend server into `dist/index.js`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

<div align="center">
  <br/>
  <p>Crafted with precision for modern focus enthusiasts.</p>
  <strong>POMOFOCUS TRACK</strong>
</div>
