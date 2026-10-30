import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
// Icons are bundled from the material-icons package instead of loaded from
// Google Fonts, so they work offline and on networks that block font CDNs.
import 'material-icons/iconfont/filled.css'
import App from './App.vue'
import router from './router'
import { useLoggedInUserStore } from './store/loggedInUser'
import { onUnauthorized } from './api/api'
import './index.css'

const app = createApp(App)

// Pinia goes first so the session can be restored before the router runs its
// first navigation guard. (The old Pinia plugin that injected the router into
// every store is gone: components navigate, the store only holds state.)
app.use(createPinia())

// Task F4: restore a saved, unexpired login on page refresh. A missing,
// expired or corrupted token simply leaves the user logged out.
const user = useLoggedInUserStore()
user.restoreSession()

app.use(router)
app.use(Toast, { position: 'bottom-right' })

// Task F2: any 401 from the API means the session is no longer valid.
// Clear the stored token and Pinia state, then send the user to /login,
// remembering where they were so login can bring them back.
onUnauthorized(() => {
  if (!user.isLoggedIn) return
  user.clearSession()
  useToast().info('Your session has ended. Please log in again.')
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath } })
  }
})

app.mount('#app')
