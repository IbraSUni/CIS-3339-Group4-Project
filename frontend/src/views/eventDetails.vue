<!-- This component allows a user to update a specific event's information. -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Event Details
      </h1>
    </div>
    <div class="px-10 py-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Event Details</h2>
        <!-- Event Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Event Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="event.name" />
            <span v-if="v$.event.name.$error" class="text-red-500">
              Event Name is required
            </span>
          </label>
        </div>

        <!-- Date input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Date</span>
            <span style="color: #ff0000">*</span>
            <input type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="event.date" />
            <span v-if="v$.event.date.$error" class="text-red-500">
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
            <span class="text-gray-700">Description</span>
            <textarea
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows="2" v-model="event.description"></textarea>
          </label>
        </div>
      </div>

      <!-- Services Offered at Event checkboxes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
        <h2 class="text-2xl font-bold">Services Offered at Event</h2>
        <div class="flex flex-col grid-cols-3">
          <div>
            <ul v-if="services.length" class="space-y-2">
              <li v-for="service in services" :key="service._id" :data-service-id="service._id"
                class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative">
                <label class="block w-full h-full">
                  <input type="checkbox" :id="service._id" :value="service._id"
                    :checked="event.services.includes(service._id)" v-model="event.services"
                    :disabled="service.status === 'Inactive'"
                    class="rounded border-gray-300 disabled:opacity-50 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2">
                  <span class="font-medium">{{ service.name }}</span>
                </label>
              </li>
            </ul>
            <!--If there are no active services for the user's organization, this will appear instead of list of checkboxes-->
            <p v-else class="text-gray-600">No Active Services Available</p>
          </div>
        </div>
      </div>

      <!-- grid container -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Address</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 1</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 2</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">City</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.city" />
          </label>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">County</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.county" />
          </label>
        </div>
        <!-- Zip Code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Zip Code</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.zip" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <!--Update Event button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitEventUpdate" type="button" class="bg-green-700 disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor || saving">
            Update Event
          </button>
        </div>
        <!--Delete Event button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitDeleteEvent" type="button" class="bg-red-700  disabled:opacity-50 text-white rounded"
            :disabled="!user.isEditor">
            Delete Event
          </button>
          <!--Go back button-->
        </div>
        <div class="flex justify-between mt-10 mr-20">
          <button type="reset" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
            Go back
          </button>
        </div>
      </div>

      <hr class="mt-10 mb-10" />

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div>
          <h2 class="text-2xl font-bold">List of Attendees</h2>
          <h3 class="italic">Click table row to view client details</h3>
        </div>
        <!--Table showing the list of attendees for the selected event-->
        <div class="flex flex-col col-span-2">
          <table class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr>
                <th class="p-4 text-left">Name</th>
                <th class="p-4 text-left">City</th>
                <th class="p-4 text-left">Phone Number</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr @click="openClient(client._id)" @keyup.enter="openClient(client._id)" tabindex="0"
                v-for="client in clients" :key="client._id" class="cursor-pointer"
                :class="{ 'hoverRow': hoverId === client._id }" @mouseenter="hoverId = client._id"
                @mouseleave="hoverId = null">
                <td class="p-2 text-left">
                  {{ client.firstName + ' ' + client.lastName }}
                </td>
                <td class="p-2 text-left">{{ client.address.city }}</td>
                <td class="p-2 text-left">
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
  </main>
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
import { getEventById, getEventAttendees, getServices, updateEvent, deleteEvent, messageOf } from '../api/api'
import { toDateInputValue } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()

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
  if (!window.confirm(`Delete the event "${event.value.name}"? This cannot be undone.`)) return
  try {
    const response = await deleteEvent(eventId.value)
    toast.success(messageOf(response, 'Event deleted'))
    router.push({ name: 'findevents' })
  } catch (err) {
    toast.error(err.message)
  }
}
</script>
