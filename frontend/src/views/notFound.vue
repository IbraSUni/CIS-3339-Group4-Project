<!-- Shown for any URL that does not match a route (catch-all in router/index.js). -->
<template>
  <div class="page">
    <StatePanel title="Page not found" icon="travel_explore">
      <template #default>
        <p class="mb-5 text-sm text-zinc-600">
          Nothing lives at <code class="rounded bg-zinc-100 px-1.5 py-0.5">{{ route.fullPath }}</code>.
        </p>
        <router-link to="/" class="btn btn-primary">Back to the dashboard</router-link>
      </template>
    </StatePanel>
  </div>
</template>

<script setup>
// Written with the Composition API from the start: useRoute() replaces this.$route.
import { useRoute } from 'vue-router'
import StatePanel from '../components/StatePanel.vue'

const route = useRoute()
</script>
