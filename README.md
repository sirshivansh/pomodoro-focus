<div align="center">
  <h1>PomoFocusTrack 🍅</h1>
  <p><strong>A production-grade, cloud-synchronized Pomodoro productivity suite.</strong></p>
  <p>
    Stay focused, track your analytics, and sync your workflow seamlessly across all devices.
  </p>
</div>

<br />

PomoFocusTrack has evolved from a local-only tool into a **fully authenticated, cloud-backed application**. Built with a sleek, neo-earthen design aesthetic, it features real-time focus tracking and persistent analytics using a robust backend infrastructure.

## ✨ New Features & Upgrades

- ☁️ **Full Cloud Synchronization**: Goodbye `localStorage`! Your pomodoro sessions, streaks, and analytics are now saved directly to the cloud via our REST API.
- 🔐 **Real User Authentication**: Secure login and registration flows requiring an **Email Address** and password, powered by Passport.js and robust server-side sessions.
- 👤 **Dynamic Profile Panel**: A newly designed, interactive profile card showing your email, focus statistics, and total time tracked right from the navigation header.
- 📊 **Centralized Analytics Engine**: Visual heatmaps and history logs are dynamically pulled from the Neon Database, ensuring your productivity data is consistent across every device you log into.
- ⚡ **Production Ready Backend**: Transitioned to a powerful Neon PostgreSQL Serverless architecture, orchestrated with Drizzle ORM.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Core Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **State Management & Caching:** [TanStack React Query](https://tanstack.com/query/latest) (handling auth & session caching)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + custom glassmorphic components
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Routing:** [Wouter](https://github.com/molefrog/wouter)

### Backend Architecture
- **Server Environment:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Authentication:** [Passport.js](https://www.passportjs.org/) (Local Strategy) + `connect-pg-simple` for session persistence
- **Database Engine:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Validation:** [Zod](https://zod.dev/)

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v20+ recommended) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sirshivansh/pomodoro-focus.git
   cd PomoFocusTrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your database configuration:
   ```env
   DATABASE_URL=postgresql://user:password@hostname/dbname
   SESSION_SECRET=your_super_secret_session_key
   ```

4. **Initialize the Database:**
   Push the schema to your PostgreSQL instance:
   ```bash
   npm run db:push
   ```

### Running Locally

To start the development server (which concurrently runs both the Vite frontend proxy and Express backend API):

```bash
npm run dev
```

Your app will be running at `http://localhost:5000`. 
**Try creating a new account using an email address to see the cloud-saving in action!**

---

## 🚢 Deployment (Render / Railway)

This project is configured for easy zero-config deployment.

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   *This command creates an optimized production bundle for the frontend in `dist/public` and compiles the backend into `dist/index.js` using esbuild.*

2. **Start the production server:**
   ```bash
   npm run start
   ```

*(Note: Don't forget to set your `DATABASE_URL` and `SESSION_SECRET` in your hosting provider's environment settings!)*

---

## 📝 License

This project is licensed under the MIT License.
