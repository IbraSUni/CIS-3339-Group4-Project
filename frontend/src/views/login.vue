<!-- This is the login view. Users can login by entering a correct username and password -->
<template>
  <div class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <img class="mx-auto h-16 w-16 rounded-full bg-brand-50" src="@/assets/DanPersona.svg" alt="" />
        <h1 class="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">Welcome</h1>
        <p class="mt-1 text-sm text-zinc-600">Sign in to manage clients, events and services.</p>
      </div>

      <form class="card card-body space-y-5" @submit.prevent="handleLogin" novalidate>
        <div>
          <label for="login-username" class="form-label">Username<span class="required-mark" aria-hidden="true">*</span></label>
          <input id="login-username" type="text" autocomplete="username" class="form-control" v-model.trim="username"
            required />
        </div>
        <div>
          <label for="login-password" class="form-label">Password<span class="required-mark" aria-hidden="true">*</span></label>
          <input id="login-password" type="password" autocomplete="current-password" class="form-control"
            v-model="password" required />
        </div>
        <button class="btn btn-primary w-full" type="submit" :disabled="submitting || !username || !password">
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: Options API object { data option { username, password }, setup() { store } }
//   After:  <script setup>
//   - data option fields         -> ref('')
//   - setup() return value  -> top-level consts are exposed automatically
//   - the store used to navigate after login through an injected router;
//     now this view does it with useRouter() and honours ?redirect=...
//     (set by the route guard) so users land on the page they asked for.
// ---------------------------------------------------------------------------
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useLoggedInUserStore } from '../store/loggedInUser'

const store = useLoggedInUserStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

// was data option: { username: '', password: '' }
const username = ref('')
const password = ref('')
const submitting = ref(false)

// Only follow redirects inside this app (paths starting with a single '/').
function safeRedirect(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

async function handleLogin() {
  if (!username.value || !password.value) return
  submitting.value = true
  try {
    await store.login(username.value, password.value)
    toast.success('Login successful!')
    router.replace(safeRedirect(route.query.redirect))
  } catch (err) {
    // err.message is already readable; it was set by the Axios interceptor.
    toast.error(err.message)
    password.value = ''
  } finally {
    submitting.value = false
  }
}
</script>
