import { createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useLoggedInUserStore } from '../store/loggedInUser'

// Route meta flags (task F4):
//   requiresAuth    must be logged in
//   requiresEditor  must be logged in with role 'editor' (create forms)
//
// History mode needs the static host to send every unknown path to index.html
// (SPA fallback). `npm run serve` does this automatically; see frontend/README.md
// and public/_redirects for production hosting.
//
// File names in the imports must match the files exactly (eventDetails.vue),
// because Linux and most CI/build servers use case-sensitive file systems.
const routes = [
  {
    path: '/',
    name: 'dashboard',
    // The dashboard's data calls will require a token after Sprint 3 (S1),
    // so the page itself now requires login.
    meta: { requiresAuth: true },
    component: () => import('../views/home.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/clientform',
    name: 'clientform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/clientform.vue')
  },
  {
    path: '/findclient',
    name: 'findclient',
    meta: { requiresAuth: true },
    component: () => import('../views/findclient.vue')
  },
  {
    path: '/clientdetails/:id',
    name: 'clientdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/clientdetails.vue')
  },
  {
    path: '/eventform',
    name: 'eventform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/eventform.vue')
  },
  {
    path: '/findevents',
    name: 'findevents',
    meta: { requiresAuth: true },
    component: () => import('../views/findevents.vue')
  },
  {
    path: '/eventdetails/:id',
    name: 'eventdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/eventDetails.vue')
  },
  {
    path: '/serviceform',
    name: 'serviceform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/serviceform.vue')
  },
  {
    path: '/findservice',
    name: 'findservice',
    meta: { requiresAuth: true },
    component: () => import('../views/findservice.vue')
  },
  {
    path: '/servicedetails/:id',
    name: 'servicedetails',
    meta: { requiresAuth: true },
    component: () => import('../views/servicedetails.vue')
  },
  {
    // Any unknown URL shows a real "not found" page instead of a blank screen.
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('../views/notFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// One global guard for authentication and the editor role.
router.beforeEach((to) => {
  const user = useLoggedInUserStore()

  // A token can expire while the tab stays open; drop it before routing.
  if (user.hasExpired()) {
    user.clearSession()
  }

  if (to.meta.requiresAuth && !user.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // A viewer who types an editor-only URL is sent back to the dashboard.
  // (The backend enforces the same rule with 403 in Sprint 3; this check is
  // for the user experience, not security.)
  if (to.meta.requiresEditor && !user.isEditor) {
    useToast().warning('Editor access is required for that page.')
    return { name: 'dashboard' }
  }

  // Already logged in: the login page has nothing to offer.
  if (to.name === 'login' && user.isLoggedIn) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
