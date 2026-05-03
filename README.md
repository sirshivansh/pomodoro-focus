# PomoFocusTrack 🍅

PomoFocusTrack is a full-stack productivity web application designed to help users manage their time effectively using the Pomodoro Technique. Built with modern web technologies, it features a sleek, agency-grade design, real-time focus tracking, and task management to optimize your workflow.

## 🚀 Features

- **Pomodoro Timer:** Fully customizable focus, short break, and long break intervals.
- **Task Management:** Create, manage, and track progress on tasks.
- **Responsive UI:** A beautiful, neo-earthen aesthetic using Tailwind CSS and Framer Motion.
- **Real-Time Data:** Persistent task and timer states stored securely in a PostgreSQL database.
- **Full-Stack Architecture:** Powered by a React frontend and an Express/Drizzle backend.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing:** [Wouter](https://github.com/molefrog/wouter)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State & Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Server:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** PostgreSQL (Optimized for [Neon Serverless](https://neon.tech/))
- **Schema Validation:** [Zod](https://zod.dev/)

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
   Create a `.env` file in the root directory and add your required variables. 
   ```env
   DATABASE_URL=postgresql://user:password@hostname/dbname
   SESSION_SECRET=your_secret_key
   ```

4. **Initialize Database (if applicable):**
   ```bash
   npm run db:push
   ```

### Running Locally

To start the development server (which concurrently runs both the Vite frontend and Express backend):

```bash
npm run dev
```

Your app will be running at `http://localhost:5000`.

## 🚢 Deployment

The project is configured for easy deployment on platforms like Render or Railway. 

1. **Build the project for production:**
   ```bash
   npm run build
   ```
   *This command creates an optimized production bundle for the frontend in `dist/public` and compiles the backend into `dist/index.js` using esbuild.*

2. **Start the production server:**
   ```bash
   npm run start
   ```

## 📝 License

This project is licensed under the MIT License.
