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

Prerequisites: Node.js 18+ and a MongoDB database.

```bash
# backend (terminal 1)
cd backend
npm install
# create backend/.env from backend/.env.example (MONGO_URL, PORT, ORG_ID, JWT_SECRET)
npm start            # http://localhost:3000   (npm run dev for auto-reload)

# frontend (terminal 2)
cd frontend
npm install
npm run dev          # http://localhost:5173
# or the production build:
npm run build && npm run serve   # http://localhost:4173
```

Demo accounts: `user` / `user` (viewer) and `admin` / `admin` (editor).

## Sprint 2 status (frontend)

| Task | Status |
| --- | --- |
| F1 Composition API | Done: every `.vue` file uses `<script setup>`; each file has a migration comment |
| F2 `useApi` + interceptor | Done: `src/composables/useApi.js`, single interceptor in `src/api/api.js` |
| F3 `DataTable` | Done: `src/components/DataTable.vue` used by Find Client, Find Events, Find Services |
| F4 Session restore + editor guard | Done: `restoreSession()` in the Pinia store, `meta.requiresEditor` + one global guard |
| D2 Deployable build | Done: builds on Windows/macOS/Linux, `npm run serve`, SPA fallback documented in `frontend/README.md` |
| S1, B1, B2, D1 (backend) | Sprint 3. The frontend already accepts the planned `{ error }` and `{ message }` reply shapes. |

Details for the frontend are in [`frontend/README.md`](frontend/README.md).

