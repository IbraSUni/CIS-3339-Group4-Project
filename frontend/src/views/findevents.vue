<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">List of Events</h1>
        <p class="page-subtitle">Search by name or date, then open an event to see its services and attendees.</p>
      </div>
      <router-link v-if="user.isEditor" to="/eventform" class="btn btn-primary">
        <span class="material-icons text-lg" aria-hidden="true">event</span>
        Create Event
      </router-link>
    </div>

    <SearchBar title="Search Event By" search-label="Search Event" @search="handleSubmitForm" @clear="clearSearch">
      <div>
        <label for="event-search-by" class="form-label">Search by</label>
        <select id="event-search-by" class="form-control" v-model="searchBy">
          <option disabled value="">Choose a field</option>
          <option value="Event Name">Event Name</option>
          <option value="Event Date">Event Date</option>
        </select>
      </div>
      <div v-if="searchBy === 'Event Name'" class="sm:col-span-2">
        <label for="event-name" class="form-label">Event name</label>
        <input id="event-name" type="text" class="form-control" v-model.trim="name" placeholder="Enter event name" />
      </div>
      <div v-else-if="searchBy === 'Event Date'">
        <label for="event-date" class="form-label">Event date</label>
        <input id="event-date" type="date" class="form-control" v-model="eventDate" />
      </div>
    </SearchBar>

    <section class="mt-8" aria-labelledby="event-list-title">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="event-list-title" class="section-title">List of Events</h2>
        <p class="text-sm text-zinc-500">
          {{ activeQuery ? 'Showing search results. Use Clear Search to see all events.' : 'Click a row to view event details.' }}
        </p>
      </div>

      <TableSkeleton v-if="loading" :columns="3" label="Loading events" />
      <StatePanel v-else-if="error" variant="error" title="Could not load events" :message="error">
        <button type="button" class="btn btn-primary" @click="execute()">Retry</button>
      </StatePanel>
      <DataTable v-else :columns="columns" :rows="events" :empty-text="emptyText" @row-click="openEvent" />
    </section>
  </div>
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
//   - loadData() set this.isLoading, which was never declared in the data option.
//   - toast.error('Error searching events', error) passed the error as the
//     toast OPTIONS argument, so the actual message was silently dropped.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import SearchBar from '../components/SearchBar.vue'
import TableSkeleton from '../components/TableSkeleton.vue'
import StatePanel from '../components/StatePanel.vue'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'
import { useLoggedInUserStore } from '../store/loggedInUser'
import { formatDate, toDateInputValue } from '../utils/formatDate'

const router = useRouter()
const user = useLoggedInUserStore() // shows the create shortcut to editors only

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
