<!-- This is the main frontend file. It displays a navigation bar and rendered components. -->

<template>
  <main class="flex flex-row">
    <div id="_container" class="min-h-screen">
      <header class="w-full">
        <section class="text-center">
          <img class="m-auto" src="@/assets/DanPersona.svg" alt="Data Platform logo" />
        </section>
        <!--Navigation bar-->
        <nav class="mt-10" aria-label="Main navigation">
          <ul class="flex flex-col gap-4">
            <!-- Dashboard link -->
            <li v-if="user.isLoggedIn">
              <router-link to="/">
                <span style="position: relative; top: 6px" class="material-icons">dashboard</span>
                Dashboard
              </router-link>
            </li>
            <!--Login link - only shows if the user is logged out-->
            <li v-if="!user.isLoggedIn">
              <router-link to="/login">
                <span style="position:relative; top: 6px" class="material-icons">login</span>
                Login
              </router-link>
            </li>
            <!--Logout - only shows if the user is logged in. A real button so it works from the keyboard.-->
            <li v-if="user.isLoggedIn">
              <button type="button" class="nav-button" @click="handleLogout">
                <span style="position:relative; top: 6px" class="material-icons">logout</span>
                Logout
              </button>
            </li>
            <!--Create links - only show for editors (user.isEditor is an allowlist on role 'editor')-->
            <li v-if="user.isEditor">
              <router-link to="/clientform">
                <span style="position: relative; top: 6px" class="material-icons">people</span>
                Client Intake Form
              </router-link>
            </li>
            <li v-if="user.isEditor">
              <router-link to="/eventform">
                <span style="position: relative; top: 6px" class="material-icons">event</span>
                Create Event
              </router-link>
            </li>
            <li v-if="user.isEditor">
              <router-link to="/serviceform">
                <span style="position: relative; top: 6px" class="material-icons">volunteer_activism</span>
                Create Service
              </router-link>
            </li>
            <!--Find links - show for any logged-in user-->
            <li v-if="user.isLoggedIn">
              <router-link to="/findclient">
                <span style="position: relative; top: 6px" class="material-icons">search</span>
                Find Client
              </router-link>
            </li>
            <li v-if="user.isLoggedIn">
              <router-link to="/findevents">
                <span style="position: relative; top: 6px" class="material-icons">search</span>
                Find Event
              </router-link>
            </li>
            <li v-if="user.isLoggedIn">
              <router-link to="/findservice">
                <span style="position: relative; top: 6px" class="material-icons">search</span>
                Find Service
              </router-link>
            </li>
          </ul>
        </nav>
        <!-- Who is logged in, and with which role -->
        <p v-if="user.isLoggedIn" class="mt-10 text-sm opacity-90">
          Signed in as {{ user.name || 'user' }} ({{ user.role }})
        </p>
      </header>
    </div>
    <div class="grow w-4/5">
      <!--Organization Name Header-->
      <section class="justify-end items-center h-24 flex"
        style="background: linear-gradient(250deg, #c8102e 70%, #efecec 50.6%)">
        <h1 class="mr-20 text-3xl text-white">{{ orgName }}</h1>
      </section>
      <!--Page Content-->
      <div>
        <router-view></router-view>
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: Options API object { setup(), data option, created hook, methods }
//   After:  <script setup>
//   - data option { orgName }          -> const orgName = ref(...)
//   - created hook { getOrgName() }  -> onMounted(loadOrgName)
//   - method logout()            -> handleLogout()
//   - this.$router                -> useRouter()
// Two template bugs were removed during the migration:
//   - created hook had `catch { throw (error) }`, which threw a ReferenceError
//     because `error` was never declared. The catch now keeps the default name.
//   - method logout() called this.$store.dispatch(...), which is the Vuex API.
//     This project uses Pinia, so that method could never have worked (and the
//     nav never called it). It is replaced by handleLogout() below.
// ---------------------------------------------------------------------------
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useLoggedInUserStore } from './store/loggedInUser'
import { getOrgName } from './api/api'

const user = useLoggedInUserStore()
const router = useRouter()
const toast = useToast()

// was data option: { orgName: 'Dataplatform' }
const orgName = ref('Dataplatform')

// was created hook: the org name is public, so it loads even before login.
async function loadOrgName() {
  try {
    orgName.value = await getOrgName()
  } catch (err) {
    // Keep the default name; the message is already readable (interceptor).
    console.warn('Could not load organization name:', err.message)
  }
}
onMounted(loadOrgName)

// was method logout(): clears the token + Pinia state, then goes to /login.
function handleLogout() {
  user.logout()
  toast.info('You have been logged out.')
  router.push({ name: 'login' })
}
</script>

<style scoped>
#_container {
  background-color: #c8102e;
  color: white;
  padding: 18px;
}

.nav-button {
  padding: 0;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
}
</style>
