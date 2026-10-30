<!--
  Main navigation, pulled out of App.vue so App.vue is layout only.
  - Desktop (md and up): fixed red sidebar.
  - Phone/tablet: a top bar with a menu button that opens the same sidebar
    as a drawer. The drawer closes on navigation, on Escape and on the overlay.
  Which links show depends on the Pinia store: find links for any logged-in
  user, create links only when user.isEditor (allowlist on role 'editor').
-->
<template>
  <!-- Mobile top bar -->
  <div class="sticky top-0 z-30 flex h-14 items-center justify-between bg-brand-600 px-4 text-white md:hidden">
    <button type="button" class="nav-icon-button" :aria-expanded="open" aria-controls="app-sidebar"
      @click="open = !open">
      <span class="material-icons" aria-hidden="true">{{ open ? 'close' : 'menu' }}</span>
      <span class="sr-only">{{ open ? 'Close menu' : 'Open menu' }}</span>
    </button>
    <span class="font-semibold">Data Platform</span>
    <span class="w-10" aria-hidden="true"></span>
  </div>

  <!-- Overlay behind the mobile drawer -->
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-30 bg-zinc-900/40 md:hidden" @click="open = false"></div>
  </Transition>

  <aside id="app-sidebar"
    class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-600 text-white transition-transform duration-200 md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'" aria-label="Sidebar">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 pb-6 pt-6">
      <img class="h-11 w-11 rounded-full bg-white/10" src="@/assets/DanPersona.svg" alt="" />
      <div class="min-w-0">
        <p class="font-semibold leading-tight">Data Platform</p>
        <p class="truncate text-xs text-white/80">{{ orgName }}</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3" aria-label="Main navigation">
      <ul class="space-y-1">
        <li v-if="!user.isLoggedIn">
          <router-link to="/login" class="nav-link">
            <span class="material-icons nav-icon" aria-hidden="true">login</span>
            Login
          </router-link>
        </li>
        <li v-if="user.isLoggedIn">
          <router-link to="/" class="nav-link" exact-active-class="nav-link-active">
            <span class="material-icons nav-icon" aria-hidden="true">dashboard</span>
            Dashboard
          </router-link>
        </li>
      </ul>

      <template v-if="user.isLoggedIn">
        <p class="nav-group">Find</p>
        <ul class="space-y-1">
          <li v-for="item in findLinks" :key="item.to">
            <router-link :to="item.to" class="nav-link" active-class="nav-link-active">
              <span class="material-icons nav-icon" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </template>

      <template v-if="user.isEditor">
        <p class="nav-group">Create</p>
        <ul class="space-y-1">
          <li v-for="item in createLinks" :key="item.to">
            <router-link :to="item.to" class="nav-link" active-class="nav-link-active">
              <span class="material-icons nav-icon" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </router-link>
          </li>
        </ul>
      </template>
    </nav>

    <!-- Signed-in user + logout -->
    <div v-if="user.isLoggedIn" class="border-t border-white/15 p-4">
      <div class="mb-3 flex items-center justify-between gap-2">
        <p class="truncate text-sm font-medium">{{ user.name || 'Signed in' }}</p>
        <span class="badge badge-role capitalize">{{ user.role }}</span>
      </div>
      <button type="button" class="nav-link w-full" @click="emit('logout')">
        <span class="material-icons nav-icon" aria-hidden="true">logout</span>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
// Composition API: defineProps/defineEmits for the interface, ref() for the
// drawer state, watch() on the route to close it after navigation.
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useLoggedInUserStore } from '../store/loggedInUser'

defineProps({
  orgName: { type: String, default: '' }
})
const emit = defineEmits(['logout'])

const user = useLoggedInUserStore()
const route = useRoute()
const open = ref(false)

// Labels are unchanged from the original nav.
const findLinks = [
  { to: '/findclient', label: 'Find Client', icon: 'person_search' },
  { to: '/findevents', label: 'Find Event', icon: 'event_note' },
  { to: '/findservice', label: 'Find Service', icon: 'manage_search' }
]
const createLinks = [
  { to: '/clientform', label: 'Client Intake Form', icon: 'person_add' },
  { to: '/eventform', label: 'Create Event', icon: 'event' },
  { to: '/serviceform', label: 'Create Service', icon: 'volunteer_activism' }
]

watch(() => route.fullPath, () => {
  open.value = false
})

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white;
}

.nav-link-active {
  @apply bg-white/15 text-white;
}

.nav-icon {
  @apply text-xl;
}

.nav-group {
  @apply mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-white/70;
}

.nav-icon-button {
  @apply -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
