<!--
  Reusable table for the client, event and service lists (task F3).

  Props
    columns  [{ label, field, render?, sortValue? }]
               field      key on the row; dotted paths work ('address.city')
               render     optional (row) => string for display
               sortValue  optional (row) => value to sort by (defaults to the field)
    rows     the rows already loaded into the page
    pageSize rows per page (default 10)
    rowKey   unique key on each row (default '_id')
    emptyText message for the "No results" row

  Emits
    row-click(row)  when a row is clicked or activated with Enter

  Sorting and paging are client-side, on whatever rows the parent passes in.
  When the parent passes a new rows array (a new search), the table goes back
  to page 1 so rows from the previous result can never stay on screen.
-->
<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th v-for="column in columns" :key="column.field" scope="col" class="px-4 py-3"
              :aria-sort="ariaSort(column.field)">
              <button type="button" class="sort-button" @click="toggleSort(column.field)"
                :title="`Sort by ${column.label}`">
                {{ column.label }}
                <span class="material-icons sort-indicator" :class="{ 'is-active': sortField === column.field }"
                  aria-hidden="true">{{ sortIcon(column.field) }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in pageRows" :key="row[rowKey]" class="data-row" tabindex="0"
            @click="emit('row-click', row)" @keyup.enter="emit('row-click', row)">
            <td v-for="column in columns" :key="column.field" class="px-4 py-3 text-zinc-800">
              {{ displayValue(row, column) }}
            </td>
          </tr>
          <!-- Empty state: one clear row instead of a blank table -->
          <tr v-if="!rows.length">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <span class="material-icons text-3xl text-zinc-400" aria-hidden="true">search_off</span>
              <p class="mt-2 font-medium text-zinc-800">{{ emptyText }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="rows.length"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-3">
      <p class="text-sm text-zinc-600" aria-live="polite">
        Showing <span class="font-medium text-zinc-900">{{ firstShown }}-{{ lastShown }}</span> of
        <span class="font-medium text-zinc-900">{{ rows.length }}</span>
      </p>
      <div class="flex items-center gap-1">
        <button type="button" class="page-button" :disabled="page === 1" @click="page = 1" aria-label="First page">
          <span class="material-icons" aria-hidden="true">first_page</span>
        </button>
        <button type="button" class="page-button" :disabled="page === 1" @click="page--" aria-label="Previous page">
          <span class="material-icons" aria-hidden="true">chevron_left</span>
        </button>
        <span class="px-2 text-sm text-zinc-700">Page {{ page }} of {{ pageCount }}</span>
        <button type="button" class="page-button" :disabled="page === pageCount" @click="page++" aria-label="Next page">
          <span class="material-icons" aria-hidden="true">chevron_right</span>
        </button>
        <button type="button" class="page-button" :disabled="page === pageCount" @click="page = pageCount"
          aria-label="Last page">
          <span class="material-icons" aria-hidden="true">last_page</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Written with the Composition API: defineProps/defineEmits for the public
// interface, ref() for sort and page state, computed() for the derived rows.
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 },
  rowKey: { type: String, default: '_id' },
  emptyText: { type: String, default: 'No results' }
})

const emit = defineEmits(['row-click'])

// ---- value helpers ----
function getValue(row, path) {
  return path.split('.').reduce((value, key) => (value == null ? value : value[key]), row)
}

function displayValue(row, column) {
  const value = column.render ? column.render(row) : getValue(row, column.field)
  return value ?? ''
}

function sortValueOf(row, column) {
  const value = column.sortValue ? column.sortValue(row) : getValue(row, column.field)
  return typeof value === 'string' ? value.toLowerCase() : value
}

// ---- sorting: click cycles ascending -> descending -> unsorted ----
const sortField = ref(null)
const sortDirection = ref(null) // 'asc' | 'desc' | null

function toggleSort(field) {
  if (sortField.value !== field) {
    sortField.value = field
    sortDirection.value = 'asc'
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc'
  } else {
    sortField.value = null
    sortDirection.value = null
  }
  page.value = 1
}

// Material Icons names for the header indicator
function sortIcon(field) {
  if (sortField.value !== field) return 'unfold_more'
  return sortDirection.value === 'asc' ? 'arrow_upward' : 'arrow_downward'
}

function ariaSort(field) {
  if (sortField.value !== field) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

const sortedRows = computed(() => {
  if (!sortField.value) return props.rows // unsorted = original order
  const column = props.columns.find((c) => c.field === sortField.value)
  const direction = sortDirection.value === 'asc' ? 1 : -1
  // Copy before sorting so the parent's array is never mutated.
  return [...props.rows].sort((a, b) => {
    const x = sortValueOf(a, column)
    const y = sortValueOf(b, column)
    // Empty values always go last, whatever the direction.
    if (x == null || x === '') return y == null || y === '' ? 0 : 1
    if (y == null || y === '') return -1
    if (x < y) return -1 * direction
    if (x > y) return 1 * direction
    return 0
  })
})

// ---- pagination ----
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))
const pageRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})
const firstShown = computed(() => (props.rows.length ? (page.value - 1) * props.pageSize + 1 : 0))
const lastShown = computed(() => Math.min(page.value * props.pageSize, props.rows.length))

// New data (for example a new search result) always starts on page 1.
watch(
  () => props.rows,
  () => {
    page.value = 1
  }
)

// Safety net if rows shrink without being replaced.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})
</script>

<style scoped>
.sort-button {
  @apply inline-flex items-center gap-1 rounded text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900;
}

.sort-indicator {
  @apply text-base text-zinc-400;
}

.sort-indicator.is-active {
  @apply text-brand-600;
}

.data-row {
  @apply cursor-pointer border-t border-zinc-100 transition-colors first:border-t-0 hover:bg-brand-50 focus:bg-brand-50;
}

.page-button {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent;
}
</style>
