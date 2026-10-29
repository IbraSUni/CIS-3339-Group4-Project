<!-- This is the login view. Users can login by entering a correct username and password -->
<template>
  <div>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">Welcome</h1>
    <!--Form-->
    <form @submit.prevent="handleLogin" novalidate="true">
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Username</span>
          <span style="color: #ff0000">*</span>
          <input type="text" autocomplete="username"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model.trim="username" />
        </label>
      </div>
      <div class="flex justify-center mt-10">
        <label>
          <span class="text-gray-700">Password</span>
          <span style="color: #ff0000">*</span>
          <input type="password" autocomplete="current-password"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="password" />
        </label>
      </div>
      <!--Login button-->
      <div class="flex justify-center mt-10">
        <button class="bg-red-700 text-white rounded disabled:opacity-50" type="submit"
          :disabled="submitting || !username || !password">
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </div>
    </form>
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
