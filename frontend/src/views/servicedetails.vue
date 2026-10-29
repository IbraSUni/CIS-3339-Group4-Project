<!-- This view allows a user to update a specific service's information. -->
<template>
  <main>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Service Details
    </h1>
    <div class="px-10 py-20">
        <!-- grid container -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Service Details</h2>
          <!-- Service Name input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Service Name</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="service.name" />
            </label>
            <span v-if="v$.service.name.$error" class="text-red-500">
              Service Name is required
            </span>
          </div>

          <!-- Description input field -->
          <div class="flex flex-col">
            <label>
              <span class="text-gray-700">Description:</span>
              <textarea
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="service.description"></textarea>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <!-- form field: update service description -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Service Status</span>
              <span style="color: #ff0000">*</span>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input type="radio" class="form-radio" value="Active" v-model="service.status">
                  <span class="ml-2">Active</span>
                </label>
                <label class="inline-flex items-center ml-6">
                  <input type="radio" class="form-radio" value="Inactive" v-model="service.status">
                  <span class="ml-2">Inactive</span>
                </label>
              </div>
            </label>
          </div>
        </div>

        <!-- grid container -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <!-- Update Service button -->
          <div class="flex justify-between mt-10 mr-20">
            <div class="flex justify-between mt-10 mr-25">
              <button @click="submitServiceUpdate" type="button" class="bg-green-700 disabled:opacity-50 text-white rounded"
                :disabled="!user.isEditor || saving">
                Update Service
              </button>
            </div>
          </div>
          <!--Delete Service button-->
          <div class="flex justify-between mt-20 mr-20">
            <button @click="submitDeleteService" type="button" class="bg-red-700 disabled:opacity-50 text-white rounded"
              :disabled="!user.isEditor">
              Delete Service
            </button>
          </div>
          <!--Go back button-->
          <div class="flex justify-between mt-20 mr-20">
            <button type="reset" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
              Go back
            </button>
          </div>
        </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--List of Events table-->
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Event Name</th>
              <th class="p-4 text-left">Event Date</th>
              <th class="p-4 text-left">Event Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr @click="openEvent(event._id)" @keyup.enter="openEvent(event._id)" tabindex="0"
              v-for="event in events" :key="event._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id"
              @mouseleave="hoverId = null">
              <td class="p-2 text-left">{{ event.name }}</td>
              <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
              <td class="p-2 text-left">{{ event.address.line1 }}</td>
            </tr>
            <tr v-if="!events.length">
              <td colspan="3" class="p-4 text-center text-gray-600">No events offer this service yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: data option { service, events, hoverId }, setup() { v$, user },
//           validations option, mounted hook, methods option { formatDate,
//           submitServiceUpdate, submitDeleteService }.
//   After:  <script setup>
//   - data option fields         -> ref()
//   - validations option         -> `rules` + useVuelidate(rules, { service })
//   - mounted hook             -> onMounted(loadService)
//   - this.$route.params.id -> useRoute(); serviceId = computed(...)
//   - this.$router          -> useRouter()
//   - formatDate method     -> shared utils/formatDate.js
// Also: role checks use the isEditor allowlist, delete asks for confirmation,
// and error toasts show readable messages.
// ---------------------------------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useLoggedInUserStore } from '../store/loggedInUser'
import { getServiceById, getEventsByServiceId, updateService, deleteService, messageOf } from '../api/api'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()

const serviceId = computed(() => route.params.id)

// ---- state (was data option) ----
const service = ref({ name: null, description: null, status: null })
const events = ref([]) // events that offer this service
const hoverId = ref(null)
const saving = ref(false)

// ---- validation (was validations option) ----
const rules = {
  service: {
    name: { required }
  }
}
const v$ = useVuelidate(rules, { service })

// ---- loading (was mounted hook) ----
async function loadService() {
  try {
    const [serviceResponse, eventsResponse] = await Promise.all([
      getServiceById(serviceId.value),
      getEventsByServiceId(serviceId.value)
    ])
    service.value = serviceResponse
    events.value = eventsResponse
  } catch (err) {
    toast.error(`Could not load the service: ${err.message}`)
  }
}
onMounted(loadService)

function openEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}

// ---- actions (were methods) ----
async function submitServiceUpdate() {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  saving.value = true
  try {
    const response = await updateService(serviceId.value, service.value)
    toast.success(messageOf(response, 'Service updated'))
    router.push({ name: 'findservice' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function submitDeleteService() {
  if (events.value.length > 0) {
    toast.info('This service cannot be deleted because events are using it.')
    return
  }
  if (!window.confirm(`Delete the service "${service.value.name}"? This cannot be undone.`)) return
  try {
    const response = await deleteService(serviceId.value)
    toast.success(messageOf(response, 'Service deleted'))
    router.push({ name: 'findservice' })
  } catch (err) {
    toast.error(err.message)
  }
}
</script>
