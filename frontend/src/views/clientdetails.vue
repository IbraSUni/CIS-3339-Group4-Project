<!-- This view allows a user to view/update a specific client's information. -->
<template>
  <div class="page">
    <!--Header-->
    <h1 class="page-title">
      Client Details
    </h1>
    <div class="card card-body mt-6">
      <!-- grid container -->
      <div class="form-grid">
        <h2 class="section-title">Personal Details</h2>
        <!-- First Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">First Name</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="text"
              class="form-control"
              placeholder v-model="client.firstName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.firstName.$error" class="field-error">
            First Name is required
          </span>
        </div>

        <!-- Middle name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Middle Name</span>
            <input type="text"
              class="form-control"
              placeholder v-model="client.middleName" />
          </label>
        </div>

        <!-- Last Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Last Name</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="text"
              class="form-control"
              placeholder v-model="client.lastName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.lastName.$error" class="field-error">
            Last Name is required
          </span>
        </div>
        <div></div>
        <!-- Email input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Email</span>
            <input type="email"
              class="form-control"
              v-model="client.email" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.email.$error" class="field-error">
            Valid Email is required
          </span>
        </div>
        <!-- Phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Phone Number</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="text"
              class="form-control"
              pattern="^[0-9]{3}[0-9]{3}[0-9]{4}$" v-model="client.phoneNumber.primary" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.phoneNumber.primary.$error" class="field-error">
            <span v-if="v$.client.phoneNumber.primary.required.$invalid">Phone Number is required</span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && v$.client.phoneNumber.primary.numeric.$invalid">
              Phone Number must contain only digits
            </span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && !v$.client.phoneNumber.primary.numeric.$invalid && (v$.client.phoneNumber.primary.minLength.$invalid || v$.client.phoneNumber.primary.maxLength.$invalid)">
              Phone Number must be exactly 10 digits
            </span>
          </span>
        </div>
        <!-- Alternative phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Alternative Phone Number</span>
            <input type="text"
              class="form-control"
              pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.alternate" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="form-grid mt-8 border-t border-zinc-100 pt-8">
        <h2 class="section-title">Address Details</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Address Line 1</span>
            <input type="text"
              class="form-control"
              v-model="client.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Address Line 2</span>
            <input type="text"
              class="form-control"
              v-model="client.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">City</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="text"
              class="form-control"
              v-model="client.address.city" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.address.city.$error" class="field-error">
            City is required
          </span>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">County</span>
            <input type="text"
              class="form-control"
              v-model="client.address.county" />
          </label>
        </div>
        <!-- Zip code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Zip Code</span>
            <input type="text"
              class="form-control"
              v-model="client.address.zip" />
          </label>
        </div>
        <div></div>
      </div>

      <!-- grid container -->
      <div class="form-grid">
        <div class="flex items-end"></div>
        <!--Update Client submit button-->
        <div class="flex items-end">
          <button @click="submitUpdateClient" type="button" class="btn btn-success"
            :disabled="!user.isEditor || saving">
            Update Client
          </button>
        </div>
        <!--Delete Client button-->
        <div class="flex items-end">
          <button @click="submitDeleteClient" type="button" class="btn btn-danger"
            :disabled="!user.isEditor">
            Delete Client
          </button>
        </div>
        <!--Go back button-->
        <div class="flex items-end">
          <button type="reset" class="btn btn-secondary" @click="router.back()">
            Go back
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10"></div>

    <!-- Client Event Information -->
    <div class="form-grid">
      <div>
        <h2 class="section-title">Events for Client</h2>
        <p class="section-hint">Click table row to view event details</p>
      </div>
      <div class="card overflow-x-auto sm:col-span-2 md:col-span-3">
        <table class="simple-table">
          <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Date</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr @click="openEvent(event._id)" @keyup.enter="openEvent(event._id)" tabindex="0"
              v-for="event in clientEvents" :key="event._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id" @mouseleave="hoverId = null">
              <td>{{ event.name }}</td>
              <td>{{ formatDate(event.date) }}</td>
              <td class="text-right">
                <span class="remove-btn-wrapper">
                  <!-- Remove "X": editors only (it had no role check before) -->
                  <button type="button" class="remove-btn text-gray-400 cursor-pointer"
                    :aria-label="`Remove client from ${event.name}`"
                    @click.stop="removeClientFromEvent(event._id)" v-if="hoverId === event._id && user.isEditor">X</button>
                </span>
              </td>
            </tr>
            <tr v-if="!clientEvents.length">
              <td colspan="3" class="p-4 text-center text-gray-600">This client is not registered for any events.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--MultiSelect to add client to events (editors only can submit)-->
      <div class="flex flex-col gap-2 sm:col-span-2 md:col-span-3 md:col-start-2">
        <label class="form-label" for="add-events">Add this client to events</label>
        <VueMultiselect id="add-events"
          class="w-full cursor-pointer"
          v-model="eventsSelected" :options="eventsFiltered" :custom-label="nameWithDate" :multiple="true"
          :close-on-select="true" placeholder="Select Events to be added" label="date" track-by="name" />
        <div class="flex">
          <!--button to add client to events-->
          <button @click="addClientToEvent" type="button" class="btn btn-primary mt-1"
            :disabled="eventsSelected.length === 0 || !user.isEditor">
            Add Client to Selected Events
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: components: { VueMultiselect }, setup() { v$, user }, data option
//           { eventsFiltered, eventsSelected, clientEvents, client, hoverId },
//           validations option, mounted hook, and six methods using this.$route /
//           this.$router.
//   After:  <script setup>
//   - components: {}        -> the imported VueMultiselect is used directly
//   - data option fields         -> ref()
//   - validations option         -> `rules` + useVuelidate(rules, { client })
//   - mounted hook             -> onMounted(loadClient)
//   - this.$route.params.id -> useRoute(); clientId = computed(...)
//   - this.$router          -> useRouter()
//   - formatDate method     -> shared utils/formatDate.js
// Behaviour fixed during the migration:
//   - Role checks were a denylist (role === 'viewer'). They now use the store's
//     isEditor allowlist, and the "X" that removes a client from an event,
//     which had no role check at all, only shows for editors.
//   - Delete (and removing the client from an event) now asks for confirmation
//     in the app's ConfirmDialog before calling the API.
//   - Error toasts used to receive objects ([object Object]) or pass the error
//     as the options argument; they now show err.message from the interceptor.
//   - Registering for several events reports which ones failed instead of
//     swallowing the error inside an un-awaited Promise.all.
//   - Register/deregister replies are read with messageOf(), which accepts the
//     current plain-text reply and the { message } reply planned for B1.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import VueMultiselect from 'vue-multiselect'
import { useLoggedInUserStore } from '../store/loggedInUser'
import { useConfirm } from '../composables/useConfirm'
import {
  getClientById,
  getClientEvents,
  getNonClientEvents,
  registerAttendee,
  deregisterAttendee,
  updateClient,
  deleteClientById,
  messageOf
} from '../api/api'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const confirm = useConfirm() // app-wide dialog, replaces window.confirm()

const clientId = computed(() => route.params.id)

// Shape of an empty client, also used to fill in any missing nested objects
// on the record that comes back from the API.
function emptyClient() {
  return {
    firstName: null,
    middleName: null,
    lastName: null,
    email: null,
    phoneNumber: { primary: null, alternate: null },
    address: { line1: null, line2: null, city: null, county: null, zip: null }
  }
}

// ---- state (was data option) ----
const client = ref(emptyClient())
const clientEvents = ref([])   // events the client is registered for
const eventsFiltered = ref([])  // events the client is NOT registered for (multiselect options)
const eventsSelected = ref([])  // events picked in the multiselect
const hoverId = ref(null)       // row under the mouse, to show the remove "X"
const saving = ref(false)

// ---- validation (was validations option) ----
const rules = {
  client: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    phoneNumber: {
      primary: {
        required,
        numeric,
        minLength: minLength(10),
        maxLength: maxLength(10)
      }
    },
    address: {
      city: { required }
    }
  }
}
const v$ = useVuelidate(rules, { client })

// ---- loading (was mounted hook) ----
async function loadClient() {
  try {
    const [clientResponse, registered, notRegistered] = await Promise.all([
      getClientById(clientId.value),
      getClientEvents(clientId.value),
      getNonClientEvents(clientId.value)
    ])
    const empty = emptyClient()
    client.value = {
      ...empty,
      ...clientResponse,
      phoneNumber: { ...empty.phoneNumber, ...clientResponse.phoneNumber },
      address: { ...empty.address, ...clientResponse.address }
    }
    clientEvents.value = registered
    eventsFiltered.value = notRegistered
  } catch (err) {
    toast.error(`Could not load the client: ${err.message}`)
  }
}

async function refreshEventLists() {
  try {
    const [registered, notRegistered] = await Promise.all([
      getClientEvents(clientId.value),
      getNonClientEvents(clientId.value)
    ])
    clientEvents.value = registered
    eventsFiltered.value = notRegistered
  } catch (err) {
    toast.error(`Could not refresh the event lists: ${err.message}`)
  }
}

onMounted(loadClient)

// ---- helpers ----
// custom label for the multiselect (was method nameWithDate)
function nameWithDate({ name, date }) {
  return `${name} (${formatDate(date)})`
}

function openEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}

// ---- actions (were methods) ----

// remove the client from one event
async function removeClientFromEvent(eventId) {
  const event = clientEvents.value.find((e) => e._id === eventId)
  const confirmed = await confirm({
    title: 'Remove from event?',
    message: `The client will be removed from ${event ? event.name : 'this event'}.`,
    confirmLabel: 'Remove',
    danger: true
  })
  if (!confirmed) return
  try {
    const response = await deregisterAttendee(eventId, clientId.value)
    toast.success(messageOf(response, 'Client removed from event'))
  } catch (err) {
    toast.error(err.message)
  }
  await refreshEventLists()
}

// register the client for every event picked in the multiselect
async function addClientToEvent() {
  const selected = eventsSelected.value
  if (!selected.length) return
  const results = await Promise.allSettled(selected.map((event) => registerAttendee(event._id, clientId.value)))

  const failed = results
    .map((result, i) => ({ result, event: selected[i] }))
    .filter(({ result }) => result.status === 'rejected')
  const succeeded = results.length - failed.length

  if (succeeded) toast.success(`Client added to ${succeeded} event${succeeded === 1 ? '' : 's'}`)
  failed.forEach(({ result, event }) => toast.error(`${event.name}: ${result.reason.message}`))

  eventsSelected.value = []
  await refreshEventLists()
}

async function submitUpdateClient() {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  saving.value = true
  try {
    const response = await updateClient(clientId.value, client.value)
    toast.success(messageOf(response, 'Client updated'))
    router.push({ name: 'findclient' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function submitDeleteClient() {
  const fullName = `${client.value.firstName ?? ''} ${client.value.lastName ?? ''}`.trim()
  const confirmed = await confirm({
    title: 'Delete client?',
    message: `${fullName || 'This client'} will be permanently removed. This cannot be undone.`,
    confirmLabel: 'Delete Client',
    danger: true
  })
  if (!confirmed) return
  try {
    const response = await deleteClientById(clientId.value)
    toast.success(messageOf(response, 'Client deleted'))
    router.push({ name: 'findclient' })
  } catch (err) {
    // e.g. 406 "Client is signed up for events and can't be deleted."
    toast.error(err.message)
  }
}
</script>

<!--Style for multiselect-->
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.remove-btn-wrapper {
  display: inline-block;
  position: relative;
}

.remove-btn {
  padding: 0 6px;
  background: none;
  border: 0;
}

.remove-btn:hover {
  color: black;
}
</style>
