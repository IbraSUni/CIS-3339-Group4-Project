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
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th v-for="column in columns" :key="column.field" class="p-4 text-left"
            :aria-sort="ariaSort(column.field)">
            <button type="button" class="sort-button" @click="toggleSort(column.field)"
              :title="`Sort by ${column.label}`">
              {{ column.label }}
              <span class="sort-indicator" aria-hidden="true">{{ sortIcon(column.field) }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-for="row in pageRows" :key="row[rowKey]" class="cursor-pointer hover:bg-red-50 focus:bg-red-50 outline-none"
          tabindex="0" @click="emit('row-click', row)" @keyup.enter="emit('row-click', row)">
          <td v-for="column in columns" :key="column.field" class="p-2 text-left">
            {{ displayValue(row, column) }}
          </td>
        </tr>
        <!-- Empty state: one clear row instead of a blank table -->
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="p-6 text-center text-gray-600">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="rows.length" class="flex flex-wrap items-center justify-between gap-4 mt-4">
      <p class="text-gray-700" aria-live="polite">Showing {{ firstShown }}-{{ lastShown }} of {{ rows.length }}</p>
      <div class="flex items-center gap-2">
        <button type="button" class="page-button" :disabled="page === 1" @click="page = 1"
          aria-label="First page">&laquo;</button>
        <button type="button" class="page-button" :disabled="page === 1" @click="page--"
          aria-label="Previous page">&lsaquo; Prev</button>
        <span class="px-2 text-gray-700">Page {{ page }} of {{ pageCount }}</span>
        <button type="button" class="page-button" :disabled="page === pageCount" @click="page++"
          aria-label="Next page">Next &rsaquo;</button>
        <button type="button" class="page-button" :disabled="page === pageCount" @click="page = pageCount"
          aria-label="Last page">&raquo;</button>
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

function sortIcon(field) {
  if (sortField.value !== field) return '↕'
  return sortDirection.value === 'asc' ? '▲' : '▼'
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
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.sort-indicator {
  font-size: 0.75em;
  color: #9ca3af;
}

.page-button {
  padding: 4px 10px;
  border: 1px solid #b91c1c;
  border-radius: 4px;
  color: #b91c1c;
  background: white;
}

.page-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
