<!-- Loading placeholder shaped like the table it replaces (header + rows). -->
<template>
  <div class="card overflow-hidden" role="status" :aria-label="label">
    <div class="flex gap-6 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
      <span v-for="col in columns" :key="col" class="h-3 flex-1 animate-pulse rounded bg-zinc-200"></span>
    </div>
    <div v-for="row in rows" :key="row" class="flex gap-6 border-b border-zinc-100 px-4 py-4 last:border-0">
      <span v-for="col in columns" :key="col" class="h-3 flex-1 animate-pulse rounded bg-zinc-100"
        :style="{ maxWidth: `${60 + ((row * 7 + col * 13) % 35)}%` }"></span>
    </div>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup>
// Composition API component: props are declared with defineProps().
defineProps({
  rows: { type: Number, default: 6 },
  columns: { type: Number, default: 3 },
  label: { type: String, default: 'Loading' }
})
</script>
