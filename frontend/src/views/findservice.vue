<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Find Services</h1>
        <p class="page-subtitle">Search by name or description, then open a service to see which events offer it.</p>
      </div>
      <router-link v-if="user.isEditor" to="/serviceform" class="btn btn-primary">
        <span class="material-icons text-lg" aria-hidden="true">volunteer_activism</span>
        Create Service
      </router-link>
    </div>

    <SearchBar title="Search Service By" search-label="Search Service" @search="handleSubmitForm" @clear="clearSearch">
      <div>
        <label for="service-search-by" class="form-label">Search by</label>
        <select id="service-search-by" class="form-control" v-model="searchBy">
          <option disabled value="">Choose a field</option>
          <option value="Service Name">Service Name</option>
          <option value="Service Description">Service Description</option>
        </select>
      </div>
      <div v-if="searchBy === 'Service Name'" class="sm:col-span-2">
        <label for="service-name" class="form-label">Service name</label>
        <input id="service-name" type="text" class="form-control" v-model.trim="name" placeholder="Enter service name" />
      </div>
      <div v-else-if="searchBy === 'Service Description'" class="sm:col-span-2">
        <label for="service-description" class="form-label">Description contains</label>
        <input id="service-description" type="text" class="form-control" v-model.trim="description"
          placeholder="Enter service description" />
      </div>
    </SearchBar>

    <section class="mt-8" aria-labelledby="service-list-title">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="service-list-title" class="section-title">List of Services</h2>
        <p class="text-sm text-zinc-500">
          {{ activeQuery ? 'Showing search results. Use Clear Search to see all services.' : 'Click a row to view service details.' }}
        </p>
      </div>

      <TableSkeleton v-if="loading" :columns="3" label="Loading services" />
      <StatePanel v-else-if="error" variant="error" title="Could not load services" :message="error">
        <button type="button" class="btn btn-primary" @click="execute()">Retry</button>
      </StatePanel>
      <DataTable v-else :columns="columns" :rows="services" :empty-text="emptyText" @row-click="openService" />
    </section>
  </div>
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
import SearchBar from '../components/SearchBar.vue'
import TableSkeleton from '../components/TableSkeleton.vue'
import StatePanel from '../components/StatePanel.vue'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'
import { useLoggedInUserStore } from '../store/loggedInUser'

const router = useRouter()
const user = useLoggedInUserStore() // shows the create shortcut to editors only

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
