// Pinia store for the logged-in user's session.
//
// Composition API migration: this used to be an "options store"
// (state / actions objects that used `this`). It is now a "setup store":
//   state()            -> ref()
//   computed getters   -> computed()
//   actions            -> plain functions
//
// Session restore (task F4): the JWT is kept in localStorage under
// TOKEN_STORAGE_KEY. restoreSession() runs once at app start (main.js), before
// the router's first navigation, so a page refresh no longer logs the user out.
// An expired, corrupted or unreadable token is removed and the user starts
// logged out instead of the app crashing.
//
// Navigation is NOT done in here anymore. The old store pushed routes through a
// router injected by a Pinia plugin; now the component that calls login() or
// logout() decides where to go, and the store only owns session state.
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import jwt_decode from 'jwt-decode'
import { loginUser, setAuthHeader, removeAuthHeader } from '../api/api'

export const TOKEN_STORAGE_KEY = 'authToken'

// Returns the token's claims, or null if it cannot be decoded or has expired.
function readValidClaims(token) {
  if (!token) return null
  let claims
  try {
    claims = jwt_decode(token)
  } catch {
    return null // not a JWT (tampered with, truncated, random text)
  }
  // A token without an exp claim is treated as invalid rather than eternal.
  if (typeof claims?.exp !== 'number') return null
  if (claims.exp * 1000 <= Date.now()) return null
  return claims
}

export const useLoggedInUserStore = defineStore('loggedInUser', () => {
  // ---- state (was: state() { return { name, role, isLoggedIn } }) ----
  const name = ref('')
  const role = ref('')
  const isLoggedIn = ref(false)
  const expiresAt = ref(null) // ms timestamp from the token's exp claim

  // ---- getters ----
  // Role checks are an allowlist: only the exact role 'editor' can edit.
  // The template used `role === 'viewer'` to disable buttons, which gave edit
  // rights to any other value (typo, new role, empty string).
  const isEditor = computed(() => isLoggedIn.value && role.value === 'editor')

  // ---- internal helpers ----
  function applyClaims(token, claims) {
    setAuthHeader(token)
    // The current backend signs `name: user.name`, which is undefined because
    // the schema field is `username`; fall back so the UI always has a label.
    name.value = claims.name || claims.username || ''
    role.value = claims.role || ''
    expiresAt.value = claims.exp * 1000
    isLoggedIn.value = true
  }

  // Clears everything without side effects like toasts or navigation. Used by
  // logout(), by the 401 handler in main.js, and when a stored token is bad.
  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      // storage can be unavailable (private mode); state is still cleared
    }
    removeAuthHeader()
    name.value = ''
    role.value = ''
    expiresAt.value = null
    isLoggedIn.value = false
  }

  // ---- actions ----

  // Called once at startup. Returns true when a valid session was restored.
  function restoreSession() {
    let token = null
    try {
      token = localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      token = null
    }
    const claims = readValidClaims(token)
    if (!claims) {
      clearSession()
      return false
    }
    applyClaims(token, claims)
    return true
  }

  // The router guard calls this on every navigation, so a session that expires
  // while the tab stays open is cleared before the next protected page loads.
  function hasExpired() {
    return isLoggedIn.value && expiresAt.value !== null && expiresAt.value <= Date.now()
  }

  // Throws an ApiError (with a readable message) when the login fails.
  async function login(username, password) {
    const token = await loginUser(username, password)
    const claims = readValidClaims(token)
    if (!claims) {
      clearSession()
      throw new Error('The server returned an invalid session token')
    }
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } catch {
      // still logged in for this tab, just not persisted across refreshes
    }
    applyClaims(token, claims)
  }

  function logout() {
    clearSession()
  }

  return { name, role, isLoggedIn, isEditor, restoreSession, hasExpired, login, logout, clearSession }
})
