# Design Spec: Task & Project Labeling with Analytics Breakdown

## Overview
Add task and project tag tracking (`#coding`, `#reading`, `#design`, `#writing`, `#study`, `#meeting`) to PomoFocusTrack. Users can assign custom task titles and tags directly on the main dashboard, view the active focus label floating on the timer ring, and inspect detailed category time breakdowns in Analytics and History.

---

## Key Components & Architecture

### 1. Database Schema Updates (`shared/schema.ts`)
- Add `taskName` (`text("task_name")`) and `tag` (`text("tag")`) fields to `pomodoroSessions` table.
- Update Zod schemas (`insertPomodoroSessionSchema`, `PomodoroSession` type).

### 2. Dashboard Tag Bar & Floating Ring Badge (`PomodoroApp.tsx` & `Timer.tsx`)
- **Integrated Tag Bar**: Rendered right under the session mode tabs with quick-tag pills (`#coding`, `#reading`, `#design`, `#writing`, `#study`) and an editable task title input.
- **Floating Timer Ring Badge**: An interactive glassmorphism badge anchored directly on top of the `Timer.tsx` ring displaying: `ACTIVE FOCUS: #coding - Build Auth API`.
- **Local Storage Persistence**: Save current task and tag selection to `localStorage` (`ft_current_task`, `ft_current_tag`) so selections persist across session switches.

### 3. Session History & Analytics (`HistoryList.tsx` & `Analytics.tsx`)
- **History List**: Display colored tag badges (`#coding` in indigo, `#reading` in emerald, `#design` in purple) and custom task names alongside completed pomodoro records.
- **Analytics Distribution Chart**: Add a **Category & Tag Time Distribution Chart** (Pie/Bar chart) in the `Analytics` dashboard calculating total hours spent per project/tag over Daily, Weekly, Monthly, and Yearly periods.

---

## User Workflow
1. User selects a category tag (`#coding`) and types a task title (*"Implement Auth"*).
2. The timer ring floats a glowing badge: `#coding • Implement Auth`.
3. When the session completes, the task name and tag are saved into PostgreSQL.
4. User opens Analytics to see exact time breakdown by category (`#coding: 4.5 hrs`, `#reading: 2.0 hrs`).
