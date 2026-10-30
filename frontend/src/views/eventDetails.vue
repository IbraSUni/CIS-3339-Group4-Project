<!-- This component allows a user to update a specific event's information. -->
<template>
  <div class="page">
    <div>
      <!--Header-->
      <h1 class="page-title">
        Event Details
      </h1>
    </div>
    <div class="card card-body mt-6">
      <div class="form-grid">
        <h2 class="section-title">Event Details</h2>
        <!-- Event Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Event Name</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="text"
              class="form-control"
              v-model="event.name" />
            <span v-if="v$.event.name.$error" class="field-error">
              Event Name is required
            </span>
          </label>
        </div>

        <!-- Date input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Date</span>
            <span class="required-mark" aria-hidden="true">*</span>
            <input type="date"
              class="form-control"
              v-model="event.date" />
            <span v-if="v$.event.date.$error" class="field-error">
              <span v-if="v$.event.date.required.$invalid">
                Event Date is required
              </span>
              <span v-else-if="!v$.event.date.required.$invalid && v$.event.date.validDate.$invalid">
                Event Date must be a valid date
              </span>
            </span>
          </label>
        </div>

        <div></div>
        <div></div>
        <!-- Description input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Description</span>
            <textarea
              class="form-control mt-1"
              rows="2" v-model="event.description"></textarea>
          </label>
        </div>
      </div>

      <!-- Services Offered at Event checkboxes -->
      <div class="form-grid mt-8 border-t border-zinc-100 pt-8">
        <h2 class="section-title">Services Offered at Event</h2>
        <div class="sm:col-span-2 md:col-span-3">
          <div>
            <ul v-if="services.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <li v-for="service in services" :key="service._id" :data-service-id="service._id"
                class="rounded-lg border border-zinc-200 px-3 py-2 transition-colors hover:bg-zinc-50">
                <label class="block w-full h-full">
                  <input type="checkbox" :id="service._id" :value="service._id"
                    :checked="event.services.includes(service._id)" v-model="event.services"
                    :disabled="service.status === 'Inactive'"
                    class="form-check mr-2">
                  <span class="font-medium">{{ service.name }}</span>
                </label>
              </li>
            </ul>
            <!--If there are no active services for the user's organization, this will appear instead of list of checkboxes-->
            <p v-else class="text-sm text-zinc-500">No Active Services Available</p>
          </div>
        </div>
      </div>

      <!-- grid container -->
      <div class="form-grid mt-8 border-t border-zinc-100 pt-8">
        <h2 class="section-title">Address</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Address Line 1</span>
            <input type="text"
              class="form-control"
              placeholder v-model="event.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Address Line 2</span>
            <input type="text"
              class="form-control"
              placeholder v-model="event.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">City</span>
            <input type="text"
              class="form-control"
              placeholder v-model="event.address.city" />
          </label>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">County</span>
            <input type="text"
              class="form-control"
              placeholder v-model="event.address.county" />
          </label>
        </div>
        <!-- Zip Code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="form-label">Zip Code</span>
            <input type="text"
              class="form-control"
              placeholder v-model="event.address.zip" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="form-grid">
        <div></div>
        <!--Update Event button-->
        <div class="flex items-end">
          <button @click="submitEventUpdate" type="button" class="btn btn-success"
            :disabled="!user.isEditor || saving">
            Update Event
          </button>
        </div>
        <!--Delete Event button-->
        <div class="flex items-end">
          <button @click="submitDeleteEvent" type="button" class="btn btn-danger"
            :disabled="!user.isEditor">
            Delete Event
          </button>
          <!--Go back button-->
        </div>
        <div class="flex items-end">
          <button type="reset" class="btn btn-secondary" @click="router.back()">
            Go back
          </button>
        </div>
      </div>

      <div class="mt-10"></div>

      <!-- grid container -->
      <div class="form-grid">
        <div>
          <h2 class="section-title">List of Attendees</h2>
          <p class="section-hint">Click table row to view client details</p>
        </div>
        <!--Table showing the list of attendees for the selected event-->
        <div class="card overflow-x-auto sm:col-span-2 md:col-span-3">
          <table class="simple-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">City</th>
                <th scope="col">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              <tr @click="openClient(client._id)" @keyup.enter="openClient(client._id)" tabindex="0"
                v-for="client in clients" :key="client._id" class="cursor-pointer"
                :class="{ 'hoverRow': hoverId === client._id }" @mouseenter="hoverId = client._id"
                @mouseleave="hoverId = null">
                <td>
                  {{ client.firstName + ' ' + client.lastName }}
                </td>
                <td>{{ client.address.city }}</td>
                <td>
                  {{ client.phoneNumber.primary }}
                </td>
              </tr>
              <tr v-if="!clients.length">
                <td colspan="3" class="p-4 text-center text-gray-600">No clients are registered for this event yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: data option { clients, services, event, hoverId }, setup() { v$, user },
//           validations option, mounted hook, methods option { submitEventUpdate,
//           submitDeleteEvent } using this.$route / this.$router.
//   After:  <script setup>
//   - data option fields         -> ref()
//   - validations option         -> `rules` + useVuelidate(rules, { event })
//   - mounted hook             -> onMounted(loadEvent)
//   - this.$route.params.id -> useRoute(); eventId = computed(...)
//   - this.$router          -> useRouter()
// Behaviour fixed during the migration:
//   - Role checks use the isEditor allowlist instead of role === 'viewer'.
//   - The delete guard compared an array to 0 (attendees != 0); it now checks
//     attendees.length, and the user confirms before deleting.
//   - toast.error('error updating event', error) dropped the error (second
//     argument is toast options); err.message is shown now.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useLoggedInUserStore } from '../store/loggedInUser'
import { useConfirm } from '../composables/useConfirm'
import { getEventById, getEventAttendees, getServices, updateEvent, deleteEvent, messageOf } from '../api/api'
import { toDateInputValue } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const confirm = useConfirm() // app-wide dialog, replaces window.confirm()

const eventId = computed(() => route.params.id)

// ---- state (was data option) ----
const clients = ref([])   // attendees of this event
const services = ref([])  // all services, for the checkbox list
const event = ref({
  name: null,
  description: null,
  date: null,
  address: { line1: null, line2: null, city: null, county: null, zip: null },
  attendees: [],
  services: []
})
const hoverId = ref(null)
const saving = ref(false)

// ---- validation (was validations option) ----
const validDate = (value) => !helpers.req(value) || !Number.isNaN(new Date(value).getTime())
const rules = {
  event: {
    name: { required },
    date: { required, validDate }
  }
}
const v$ = useVuelidate(rules, { event })

// ---- loading (was mounted hook) ----
async function loadEvent() {
  try {
    const [eventResponse, attendees, allServices] = await Promise.all([
      getEventById(eventId.value),
      getEventAttendees(eventId.value),
      getServices()
    ])
    event.value = {
      ...eventResponse,
      // <input type="date"> needs YYYY-MM-DD
      date: toDateInputValue(eventResponse.date),
      address: { line1: null, line2: null, city: null, county: null, zip: null, ...eventResponse.address },
      // compare service ids as strings so the checkboxes match
      services: (eventResponse.services || []).map(String),
      attendees: eventResponse.attendees || []
    }
    clients.value = attendees
    services.value = allServices
  } catch (err) {
    toast.error(`Could not load the event: ${err.message}`)
  }
}
onMounted(loadEvent)

function openClient(id) {
  router.push({ name: 'clientdetails', params: { id } })
}

// ---- actions (were methods) ----
async function submitEventUpdate() {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  saving.value = true
  try {
    const response = await updateEvent(eventId.value, event.value)
    toast.success(messageOf(response, 'Event updated'))
    router.push({ name: 'findevents' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function submitDeleteEvent() {
  if (event.value.attendees.length > 0) {
    toast.info('This event cannot be deleted because it has attendees.')
    return
  }
  const confirmed = await confirm({
    title: 'Delete event?',
    message: `"${event.value.name}" will be permanently removed. This cannot be undone.`,
    confirmLabel: 'Delete Event',
    danger: true
  })
  if (!confirmed) return
  try {
    const response = await deleteEvent(eventId.value)
    toast.success(messageOf(response, 'Event deleted'))
    router.push({ name: 'findevents' })
  } catch (err) {
    toast.error(err.message)
  }
}
</script>
