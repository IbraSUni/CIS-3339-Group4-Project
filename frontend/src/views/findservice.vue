<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold" id="service-search-by">Search Service By</h2>
        <!-- Displays Service Name or Service Description selection -->
        <div class="flex flex-col">
          <select aria-labelledby="service-search-by"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>
        <!--Displays service name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Name'">
          <label class="block">
            <span class="sr-only">Service name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model.trim="name" @keyup.enter="handleSubmitForm" placeholder="Enter service name" />
          </label>
        </div>
        <!--Displays service description search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Description'">
          <label class="block">
            <span class="sr-only">Service description</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model.trim="description" @keyup.enter="handleSubmitForm" placeholder="Enter service description" />
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
          <!--Search Service button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
        <p v-if="activeQuery" class="mt-2 text-sm text-gray-600">Showing search results. Use Clear Search to see all services.</p>
      </div>
      <div class="flex flex-col col-span-2 mb-10">
        <!-- Loading state -->
        <div v-if="loading" class="p-10 text-center border rounded bg-gray-50" role="status">
          <p class="text-xl font-bold text-gray-500 animate-pulse">Loading services...</p>
        </div>

        <!-- Error state with retry -->
        <div v-else-if="error" class="p-6 text-center border border-red-200 rounded bg-red-50" role="alert">
          <p class="text-lg font-bold text-red-900">Could not load services</p>
          <p class="text-red-800 mt-1">{{ error }}</p>
          <button class="mt-4 bg-red-700 text-white rounded" @click="execute()">Retry</button>
        </div>

        <!-- Data -->
        <DataTable v-else :columns="columns" :rows="services" :empty-text="emptyText" @row-click="openService" />
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1), useApi (task F2), DataTable (task F3)
//   Before: data option { services, searchBy, name, description, hoverId },
//           mounted hook, methods option { loadData, handleSubmitForm }.
//   After:
//   - search fields            -> ref()
//   - services/loading/error   -> useApi(); execute() re-runs the list or search
//   - <table> + hoverId        -> <DataTable> with a Status column added
//   - toast.error(error) calls that rendered [object Object] -> inline error state
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

// was data option: search parameters
const searchBy = ref('')
const name = ref('')
const description = ref('')

const activeQuery = ref(null) // null = all services

const { data, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchServices(activeQuery.value) : getServices()
)
const services = computed(() => data.value ?? [])

const emptyText = computed(() =>
  activeQuery.value ? 'No services match your search.' : 'No services have been created yet.'
)

const columns = [
  { label: 'Service Name', field: 'name' },
  { label: 'Service Description', field: 'description' },
  { label: 'Status', field: 'status' }
]

onMounted(execute)

function clearSearch() {
  searchBy.value = ''
  name.value = ''
  description.value = ''
  activeQuery.value = null
  execute()
}

function handleSubmitForm() {
  if (searchBy.value === 'Service Name' && name.value) {
    activeQuery.value = { searchBy: 'name', name: name.value }
  } else if (searchBy.value === 'Service Description' && description.value) {
    activeQuery.value = { searchBy: 'description', description: description.value }
  } else {
    return
  }
  execute()
}

function openService(service) {
  router.push({ name: 'servicedetails', params: { id: service._id } })
}
</script>
