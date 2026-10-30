<!-- Root layout: navigation (NavBar.vue), organization header, routed page, app-wide confirm dialog. -->
<template>
  <div class="min-h-screen">
    <NavBar :org-name="orgName" @logout="handleLogout" />

    <div class="md:pl-64">
      <!-- Organization header -->
      <header class="hidden h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 md:flex">
        <p class="text-base font-semibold text-zinc-900">{{ orgName }}</p>
        <p v-if="user.isLoggedIn" class="text-sm text-zinc-500">
          Signed in as <span class="font-medium text-zinc-800">{{ user.name || user.role }}</span>
        </p>
      </header>

      <main>
        <router-view />
      </main>
    </div>

    <ConfirmDialog />
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: Options API object { setup(), data option, created hook, methods }
//   After:  <script setup>
//   - data option { orgName }    -> const orgName = ref(...)
//   - created hook               -> onMounted(loadOrgName)
//   - method logout()            -> handleLogout()
//   - this.$router               -> useRouter()
// Two template bugs were removed during the migration:
//   - the created hook had `catch { throw (error) }`, which threw a
//     ReferenceError because `error` was never declared.
//   - method logout() called this.$store.dispatch(...), the Vuex API; this
//     project uses Pinia, so it could never have worked.
// Sprint 2 follow-up: the sidebar moved to components/NavBar.vue so this file
// is layout only, and the app-wide <ConfirmDialog /> is mounted here.
// ---------------------------------------------------------------------------
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import NavBar from './components/NavBar.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useLoggedInUserStore } from './store/loggedInUser'
import { getOrgName } from './api/api'

const user = useLoggedInUserStore()
const router = useRouter()
const toast = useToast()

const orgName = ref('Data Platform')

// The organization name is public, so it loads even before login.
async function loadOrgName() {
  try {
    orgName.value = await getOrgName()
  } catch (err) {
    console.warn('Could not load organization name:', err.message)
  }
}
onMounted(loadOrgName)

function handleLogout() {
  user.logout()
  toast.info('You have been logged out.')
  router.push({ name: 'login' })
}
</script>
