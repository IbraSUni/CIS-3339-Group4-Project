# Data Platform Frontend

Vue 3 single-page app built with [Vite](https://vitejs.dev/), styled with
[Tailwind CSS](https://tailwindcss.com/), state in [Pinia](https://pinia.vuejs.org/),
routing with Vue Router, form validation with [Vuelidate](https://vuelidate-next.netlify.app/).

Every component uses the **Composition API with `<script setup>`** (Sprint 2, task F1).
Each migrated file starts with a comment that lists what moved where.

## Prerequisites

- Node.js 18 or newer (tested with Node 20 and 22)
- The backend API running (see `../backend/README.md`)

## Configuration

`frontend/.env` is committed with the grading configuration:

```env
VITE_ROOT_API=http://localhost:3000
```

`VITE_ROOT_API` is the base URL of the backend REST API. It is the only place the
API address is set; nothing in `src/` hard-codes `localhost`. Vite reads it at
**build time**, so rebuild after changing it. `.env.example` documents the same
variable for other environments.

## Commands

```bash
npm install        # install dependencies
npm run dev        # development server with hot reload (http://localhost:5173)
npm run build      # production build into dist/
npm run serve      # serve the production build locally (http://localhost:4173)
npm test           # unit tests (Vitest)
```

`npm run preview` is an alias of `npm run serve`.

## Tests

`npm test` runs the Vitest suite in `tests/` (jsdom, Vue Test Utils): `useApi`, the
Axios interceptor, `DataTable` sorting and paging, session restore and logout, the
route guard, and the confirm dialog. No backend or database is needed.

## Demo accounts

Created by `npm run db:init` in `backend/`.


| Role | Username | Password |
| --- | --- | --- |
| Viewer | `user` | `user` |
| Editor | `admin` | `admin` |

Viewers can read clients, events and services. Editors can also create, update,
delete, and register clients for events. A viewer who types an editor-only URL
(`/clientform`, `/eventform`, `/serviceform`) is redirected to the dashboard.

## How the app is organized

```text
src/
  api/api.js              Axios client + the single response interceptor
  composables/useApi.js   { data, loading, error, execute } for API calls
  components/DataTable.vue      sortable, paginated table used by the three list views
  components/SearchBar.vue      search panel shared by the three list views
  components/NavBar.vue         sidebar on desktop, menu drawer on phones
  components/ConfirmDialog.vue  app-wide confirm dialog (open it with useConfirm())
  components/TableSkeleton.vue, StatePanel.vue  loading, empty and error states
  components/barChart.vue, donutZipChart.vue    dashboard charts
  composables/useConfirm.js     promise-based confirm, replaces window.confirm()
  router/index.js         routes + one global guard (requiresAuth, requiresEditor)
  store/loggedInUser.js   Pinia setup store: session, role, restore on refresh
  utils/formatDate.js     shared date formatting
  index.css               design tokens and shared classes (buttons, cards, forms)
  views/                  pages
tests/                    Vitest unit tests
```

Styling: Tailwind with one accent color (UH red, `brand-*` in `tailwind.config.js`) and
shared classes in `src/index.css` (`btn`, `card`, `form-control`, ...). Icons come from the
`material-icons` npm package, so nothing is loaded from Google Fonts.

### Error handling (task F2)

- `api.js` has one Axios response interceptor. It turns every failure into a short
  message: **"Unable to reach the server"** when there is no response, otherwise the
  server's own message (`{ error }`, `{ message }` or plain text).
- A `401` clears the stored token and the Pinia session and sends the user to
  `/login` (the page they were on is kept in `?redirect=`).
- Views never translate errors themselves; they show `error` from `useApi()` or
  `err.message` in a toast.

### Session restore (task F4)

The JWT is stored in `localStorage` (`authToken`). On startup `main.js` calls
`restoreSession()` before the router runs: a valid, unexpired token restores the
Axios `Authorization` header and the Pinia state, so a refresh keeps you logged in.
An expired, corrupted or unreadable token is removed and you start logged out.
Logout clears both the token and the store.

## Deployment (task D2)

`npm run build` writes a static site to `dist/`. Any static host works.

1. Set `VITE_ROOT_API` to the deployed backend URL (in `.env`, or as a build
   environment variable on the host), then run `npm run build`.
2. Publish `dist/`.
3. **SPA fallback:** the router uses HTML5 history mode, so the host must answer
   every unknown path with `index.html`; otherwise refreshing a nested route such as
   `/clientdetails/:id` returns a 404.
   - Netlify / Cloudflare Pages: `public/_redirects` (copied into `dist/`) already
     contains `/*  /index.html  200`.
   - Other hosts: add an equivalent rewrite rule to `index.html`.
   - `npm run serve` already does this locally.
4. **CORS:** the backend must allow the deployed frontend origin
   (`CORS_ORIGIN` in `backend/.env`, Sprint 3, task S1).

Asset paths are resolved by Vite at build time with forward slashes, and file
names in imports match the files exactly, so the build behaves the same on
Windows, macOS and Linux.
