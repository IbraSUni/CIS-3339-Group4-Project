<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold" id="client-search-by">Search Client By</h2>
        <div class="flex flex-col">
          <select aria-labelledby="client-search-by"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <span class="sr-only">First name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model.trim="firstName" @keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <span class="sr-only">Last name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model.trim="lastName" @keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <label class="block">
            <span class="sr-only">Phone number</span>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              type="text" v-model.trim="phoneNumber" @keyup.enter="handleSubmitForm"
              placeholder="Enter Client Phone Number" />
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
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
        <p v-if="activeQuery" class="mt-2 text-sm text-gray-600">Showing search results. Use Clear Search to see all clients.</p>
      </div>
      <div class="flex flex-col col-span-2 mb-10">
        <!-- Loading state -->
        <div v-if="loading" class="p-10 text-center border rounded bg-gray-50" role="status">
          <p class="text-xl font-bold text-gray-500 animate-pulse">Loading clients...</p>
        </div>

        <!-- Error state with retry -->
        <div v-else-if="error" class="p-6 text-center border border-red-200 rounded bg-red-50" role="alert">
          <p class="text-lg font-bold text-red-900">Could not load clients</p>
          <p class="text-red-800 mt-1">{{ error }}</p>
          <button class="mt-4 bg-red-700 text-white rounded" @click="execute()">Retry</button>
        </div>

        <!-- Data (DataTable shows its own "No results" row when empty) -->
        <DataTable v-else :columns="columns" :rows="clients" :empty-text="emptyText" @row-click="openClient" />
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1), useApi (task F2), DataTable (task F3)
//   Before: data option { clients, searchBy, firstName, lastName, phoneNumber,
//           hoverId }, mounted hook -> loadData(), methods option { loadData,
//           handleSubmitForm }, and a hand-written <table>.
//   After:
//   - search fields       -> ref('')
//   - clients/loading/error -> one useApi() call. The call reads activeQuery,
//     so execute() re-runs whatever the user last asked for: the full list,
//     or the last search. The Retry button simply calls execute() again.
//   - mounted hook           -> onMounted(execute)
//   - $router.push(...)   -> useRouter().push(...)
//   - hoverId + <table>   -> <DataTable> (sorting, paging, empty row built in)
//   - every `toast.error(error)` that showed [object Object] is gone; errors
//     are shown inline from useApi's error string.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

// was data option: search parameters
const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

// null = show every client; otherwise the query object sent to /clients/search
const activeQuery = ref(null)

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchClients(activeQuery.value) : getClients()
)
const clients = computed(() => data.value ?? [])

const emptyText = computed(() =>
  activeQuery.value ? 'No clients match your search.' : 'No clients have been added yet.'
)

// Column definitions for DataTable. render() builds the display text;
// sorting uses the same text for the name column.
const columns = [
  {
    label: 'Name',
    field: 'lastName',
    render: (c) => `${c.firstName} ${c.lastName}`,
    sortValue: (c) => `${c.lastName} ${c.firstName}`
  },
  { label: 'Phone number', field: 'phoneNumber.primary' },
  { label: 'City', field: 'address.city' }
]

// was mounted hook: this.loadData()
onMounted(execute)

// was method loadData(), used by the Clear Search button
function clearSearch() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
  activeQuery.value = null
  execute()
}

// was method handleSubmitForm()
function handleSubmitForm() {
  if (searchBy.value === 'Client Name' && (firstName.value || lastName.value)) {
    activeQuery.value = { searchBy: 'name', firstName: firstName.value, lastName: lastName.value }
  } else if (searchBy.value === 'Client Number' && phoneNumber.value) {
    activeQuery.value = { searchBy: 'number', phoneNumber: phoneNumber.value }
  } else {
    return // nothing to search for
  }
  execute()
}

function openClient(client) {
  router.push({ name: 'clientdetails', params: { id: client._id } })
}
</script>
