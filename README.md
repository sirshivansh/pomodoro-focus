# PomoFocusTrack 🍅

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

**PomoFocusTrack** is a production-grade, cloud-synchronized Pomodoro productivity suite. Built with an agency-grade design philosophy, it bridges the gap between aesthetic beauty and high-performance functionality.

---

## 🚀 The "Quartz" Update (v1.2.0)

We've evolved. PomoFocusTrack is no longer just a browser tab—it's a productivity ecosystem.

- ⚡ **High-Precision Quartz Engine**: Drift-free timer synced to the absolute system clock (`Date.now()`).
- 🪟 **Mini-Window Mode**: Pop out a compact, content-only timer that stays on top of your workflow.
- 📡 **Real-Time Cross-Window Sync**: Actions in the mini-timer reflect in the main app instantly via the BroadcastChannel API.
- 🎙️ **Premium Audio & Voice**: Synthetic startup chimes and AI-powered voice announcements keep you informed without looking at the screen.
- 💀 **Advanced Skeleton Loaders**: High-fidelity, pulsing dark-mode skeletons eliminate loading "white flashes" for a premium zero-latency feel.
- 🕹️ **Remote Interactive Controls**: Pause, skip, or reset your focus session from any open window.

---

## ✨ Core Features

- ☁️ **Cloud Synchronization**: Every session, streak, and achievement is saved to a serverless PostgreSQL database (Neon).
- 🔐 **Secure Authentication**: Robust session-based auth powered by Passport.js and secure cookie management.
- 📊 **Deep Analytics**: GitHub-style weekly heatmaps, streak tracking, and daily focus distribution charts.
- 🏆 **Gamified Achievements**: Unlock badges (Novice, Scholar, Deep Work Master) as you hit focus milestones.
- 🎨 **Agency-Grade UI/UX**: Custom "Neo-Earthen" dark theme with glassmorphism, radial glows, and fluid Framer Motion animations.
- ⌨️ **Keyboard Mastery**: Power-user hotkeys (`Space`, `N`, `R`) for seamless control.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TanStack Query, Tailwind CSS, Framer Motion, Wouter, Lucide Icons |
| **Backend** | Node.js, Express, Passport.js, Zod, express-session |
| **Database** | Neon PostgreSQL (Serverless), Drizzle ORM |
| **Real-time** | BroadcastChannel API, Web Audio API, Speech Synthesis API |

---

## 💻 Getting Started

### Prerequisites
- Node.js (v20+)
- npm / pnpm

### Installation

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/sirshivansh/pomodoro-focus.git
   cd PomoFocusTrack
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL=postgresql://user:password@hostname/dbname?sslmode=require
   SESSION_SECRET=your_secure_secret_here
   ```

4. **Initialize Database**:
   ```bash
   npm run db:push
   ```

### Running Locally

```bash
# Start the full stack concurrently
npm run dev
```
The app will launch at `http://localhost:5000`.

---

## 🚢 Deployment

Optimized for **Render**, **Railway**, or **Vercel**.

1. **Build**: `npm run build`
2. **Start**: `npm run start`

The build process compiles the frontend into `dist/public` and the backend into `dist/index.js` for a unified production environment.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br/>
  <p>Built with precision for the modern focus enthusiast.</p>
  <strong>POMOFOCUS TRACK</strong>
</div>
