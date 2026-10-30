
<template>
    <section>
      <!-- Search fields are provided by the parent view -->
      <div class="px-10 pt-20">
        <slot />
      </div>
  
      <!-- Reusable search action buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
  
        <div class="mt-5 grid-cols-2">
          <button
            class="mr-10 border border-red-700 bg-white text-red-700 rounded"
            @click="emit('clear')"
            type="button"
          >
            Clear Search
          </button>
  
          <button
            class="bg-red-700 text-white rounded"
            @click="emit('search')"
            type="button"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  // Composition API:
  // defineEmits() replaces the Options API emits configuration.
  // The parent component handles the actual search and clear operations.
  
  const emit = defineEmits(['search', 'clear'])
  </script>
  