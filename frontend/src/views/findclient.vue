<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Find Client</h1>
        <p class="page-subtitle">Search by name or phone number, then open a client to see their details and events.</p>
      </div>
      <router-link v-if="user.isEditor" to="/clientform" class="btn btn-primary">
        <span class="material-icons text-lg" aria-hidden="true">person_add</span>
        Add Client
      </router-link>
    </div>

    <SearchBar title="Search Client By" search-label="Search Client" @search="handleSubmitForm" @clear="clearSearch">
      <div>
        <label for="client-search-by" class="form-label">Search by</label>
        <select id="client-search-by" class="form-control" v-model="searchBy">
          <option disabled value="">Choose a field</option>
          <option value="Client Name">Client Name</option>
          <option value="Client Number">Client Number</option>
        </select>
      </div>
      <template v-if="searchBy === 'Client Name'">
        <div>
          <label for="client-first-name" class="form-label">First name</label>
          <input id="client-first-name" type="text" class="form-control" v-model.trim="firstName"
            placeholder="Enter first name" />
        </div>
        <div>
          <label for="client-last-name" class="form-label">Last name</label>
          <input id="client-last-name" type="text" class="form-control" v-model.trim="lastName"
            placeholder="Enter last name" />
        </div>
      </template>
      <div v-else-if="searchBy === 'Client Number'">
        <label for="client-phone" class="form-label">Phone number</label>
        <input id="client-phone" type="text" inputmode="numeric" class="form-control" v-model.trim="phoneNumber"
          placeholder="Enter Client Phone Number" />
      </div>
    </SearchBar>

    <section class="mt-8" aria-labelledby="client-list-title">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="client-list-title" class="section-title">List of Clients</h2>
        <p class="text-sm text-zinc-500">
          {{ activeQuery ? 'Showing search results. Use Clear Search to see all clients.' : 'Click a row to view client details.' }}
        </p>
      </div>

      <!-- Loading, error (with retry), then data. DataTable shows its own empty row. -->
      <TableSkeleton v-if="loading" :columns="3" label="Loading clients" />
      <StatePanel v-else-if="error" variant="error" title="Could not load clients" :message="error">
        <button type="button" class="btn btn-primary" @click="execute()">Retry</button>
      </StatePanel>
      <DataTable v-else :columns="columns" :rows="clients" :empty-text="emptyText" @row-click="openClient" />
    </section>
  </div>
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
import TableSkeleton from '../components/TableSkeleton.vue'
import StatePanel from '../components/StatePanel.vue'
import SearchBar from '../components/SearchBar.vue'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'
import { useLoggedInUserStore } from '../store/loggedInUser'

const router = useRouter()
const user = useLoggedInUserStore() // shows the create shortcut to editors only

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
