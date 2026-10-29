<!-- Shown for any URL that does not match a route (catch-all in router/index.js). -->
<template>
  <main class="flex flex-col items-center mt-24 gap-6">
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center">Page not found</h1>
    <p class="text-gray-700">
      Nothing lives at <code class="bg-gray-100 px-1 rounded">{{ route.fullPath }}</code>.
    </p>
    <router-link to="/" class="bg-red-700 text-white rounded px-4 py-2">Back to the dashboard</router-link>
  </main>
</template>

<script setup>
// Written with the Composition API from the start: useRoute() replaces this.$route.
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
