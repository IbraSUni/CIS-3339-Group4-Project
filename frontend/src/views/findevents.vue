<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold" id="event-search-by">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select aria-labelledby="event-search-by"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <span class="sr-only">Event name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model.trim="name" @keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <label class="block">
            <span class="sr-only">Event date</span>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              type="date" v-model="eventDate" @keyup.enter="handleSubmitForm" />
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="clearSearch" type="button">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
        <p v-if="activeQuery" class="mt-2 text-sm text-gray-600">Showing search results. Use Clear Search to see all events.</p>
      </div>
      <div class="flex flex-col col-span-2 mb-10">
        <!-- Loading state -->
        <div v-if="loading" class="p-10 text-center border rounded bg-gray-50" role="status">
          <p class="text-xl font-bold text-gray-500 animate-pulse">Loading events...</p>
        </div>

        <!-- Error state with retry -->
        <div v-else-if="error" class="p-6 text-center border border-red-200 rounded bg-red-50" role="alert">
          <p class="text-lg font-bold text-red-900">Could not load events</p>
          <p class="text-red-800 mt-1">{{ error }}</p>
          <button class="mt-4 bg-red-700 text-white rounded" @click="execute()">Retry</button>
        </div>

        <!-- Data -->
        <DataTable v-else :columns="columns" :rows="events" :empty-text="emptyText" @row-click="openEvent" />
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1), useApi (task F2), DataTable (task F3)
//   Before: data option { events, searchBy, name, eventDate, hoverId }, mounted hook,
//           methods option { loadData, handleSubmitForm, formatDate }.
//   After:
//   - search fields          -> ref()
//   - events/loading/error   -> useApi(); execute() re-runs the current list or search
//   - formatDate method      -> shared utils/formatDate.js (used by the Date column)
//   - <table> + hoverId      -> <DataTable>
// Bugs removed during the migration:
//   - loadData() set this.isLoading, which was never declared in data option: 
//   - toast.error('Error searching events', error) passed the error as the
//     toast OPTIONS argument, so the actual message was silently dropped.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'
import { formatDate, toDateInputValue } from '../utils/formatDate'

const router = useRouter()

// was data option: search parameters
const searchBy = ref('')
const name = ref('')
const eventDate = ref('')

const activeQuery = ref(null) // null = all events

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchEvents(activeQuery.value) : getEvents()
)
const events = computed(() => data.value ?? [])

const emptyText = computed(() =>
  activeQuery.value ? 'No events match your search.' : 'No events have been created yet.'
)

const columns = [
  { label: 'Event Name', field: 'name' },
  // Displayed as MM/DD/YYYY but sorted by the real date value.
  { label: 'Event Date', field: 'date', render: (e) => formatDate(e.date), sortValue: (e) => new Date(e.date).getTime() },
  { label: 'Event Address', field: 'address.line1' }
]

onMounted(execute)

function clearSearch() {
  searchBy.value = ''
  name.value = ''
  eventDate.value = ''
  activeQuery.value = null
  execute()
}

function handleSubmitForm() {
  if (searchBy.value === 'Event Name' && name.value) {
    activeQuery.value = { searchBy: 'name', name: name.value }
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    activeQuery.value = { searchBy: 'date', eventDate: toDateInputValue(eventDate.value) }
  } else {
    return
  }
  execute()
}

function openEvent(event) {
  router.push({ name: 'eventdetails', params: { id: event._id } })
}
</script>
