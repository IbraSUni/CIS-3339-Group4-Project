<!--
  Reusable search panel for the three list views (Find Client, Find Events,
  Find Services). Created by Saad; restyled and extended to all three views.
  - The parent view supplies the search fields through the default slot.
  - Emits 'search' and 'clear'; the parent runs the actual query.
  - Pressing Enter in any field submits, because the panel is a real <form>.
-->
<template>
  <form class="card card-body" role="search" :aria-label="title" @submit.prevent="emit('search')">
    <h2 class="section-title">{{ title }}</h2>
    <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
      <div class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        <slot />
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn btn-secondary" @click="emit('clear')">Clear Search</button>
        <button type="submit" class="btn btn-primary">
          <span class="material-icons text-lg" aria-hidden="true">search</span>
          {{ searchLabel }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
// Composition API: defineProps() and defineEmits() replace the Options API
// props/emits configuration. The parent handles the search and clear logic.
defineProps({
  title: { type: String, default: 'Search' },
  searchLabel: { type: String, default: 'Search' }
})

const emit = defineEmits(['search', 'clear'])
</script>
