# Data Platform Project Setup

This project has been developed over time by students in the CIS 4339 course.

The current iteration is based on development done by:
* Jeremy Griffith and Edwin Charly in Spring of 2023
* Elliot Farmer Garcia, Agatha	Molski and Chris Blanco in Fall of 2022.

## Requirements

This project uses NodeJS, VUEJS and MongoDB.

## Backend Node Application
```
cd backend
```
Follow instructions in backend README for setup and running as a local instance.

## Frontend Vue 3 Application
```
cd frontend
```
Follow instructions in frontend README for setup and running as a local instance.

## Quick start (Group 4, Fall 2026)

Prerequisites:

- Node.js 18 or newer
- MongoDB: either [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally
  (the committed `backend/.env` points at `mongodb://127.0.0.1:27017/dataplatform`), or a MongoDB Atlas
  connection string pasted into `MONGO_URL` in `backend/.env`

```bash
# backend (terminal 1)
cd backend
npm install
npm run db:init      # creates the organization, the demo accounts and sample data (safe to re-run)
npm start            # http://localhost:3000   (npm run dev for auto-reload)

# frontend (terminal 2)
cd frontend
npm install
npm run dev          # http://localhost:5173
# or the production build:
npm run build && npm run serve   # http://localhost:4173
```

| Role | Username | Password |
| --- | --- | --- |
| Viewer | `user` | `user` |
| Editor | `admin` | `admin` |

`npm run db:reset` deletes this organization's users, clients, events and services first, then seeds again.

## Tests

```bash
cd frontend
npm test             # 27 Vitest tests: useApi, the API interceptor, DataTable, session restore, route guard, confirm dialog
```

## Sprint 2 status (frontend)

| Task | Status |
| --- | --- |
| F1 Composition API | Done: every `.vue` file uses `<script setup>`; each file has a migration comment |
| F2 `useApi` + interceptor | Done: `src/composables/useApi.js`, single interceptor in `src/api/api.js` |
| F3 `DataTable` | Done: `src/components/DataTable.vue` used by Find Client, Find Events, Find Services |
| F4 Session restore + editor guard | Done: `restoreSession()` in the Pinia store, `meta.requiresEditor` + one global guard |
| D2 Deployable build | Done: builds on Windows/macOS/Linux, `npm run serve`, SPA fallback documented in `frontend/README.md` |
| Extra components | `SearchBar`, `NavBar` (responsive), `ConfirmDialog`, `TableSkeleton`, `StatePanel` |
| D1 database init | Done early: `npm run db:init` in `backend/` |
| S1, B1, B2 (backend) | Sprint 3. The frontend already accepts the planned `{ error }` and `{ message }` reply shapes. |

Details for the frontend are in [`frontend/README.md`](frontend/README.md).
