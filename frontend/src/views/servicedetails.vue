<!-- This view allows a user to update a specific service's information. -->
<template>
  <div class="page">
    <!--Header-->
    <h1 class="page-title">
      Service Details
    </h1>
    <div class="card card-body mt-6">
        <!-- grid container -->
        <div class="form-grid">
          <h2 class="section-title">Service Details</h2>
          <!-- Service Name input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Service Name</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input type="text"
                class="form-control"
                v-model="service.name" />
            </label>
            <span v-if="v$.service.name.$error" class="field-error">
              Service Name is required
            </span>
          </div>

          <!-- Description input field -->
          <div class="flex flex-col">
            <label>
              <span class="form-label">Description:</span>
              <textarea
                class="form-control"
                v-model="service.description"></textarea>
            </label>
          </div>
        </div>

        <div class="form-grid">
          <div></div>
          <!-- form field: update service description -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Service Status</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input type="radio" class="form-radio text-brand-600 focus:ring-brand-500" value="Active" v-model="service.status">
                  <span class="ml-2">Active</span>
                </label>
                <label class="inline-flex items-center ml-6">
                  <input type="radio" class="form-radio text-brand-600 focus:ring-brand-500" value="Inactive" v-model="service.status">
                  <span class="ml-2">Inactive</span>
                </label>
              </div>
            </label>
          </div>
        </div>

        <!-- grid container -->
        <div class="form-grid">
          <div></div>
          <!-- Update Service button -->
          <div class="flex items-end">
            <div class="flex items-end">
              <button @click="submitServiceUpdate" type="button" class="btn btn-success"
                :disabled="!user.isEditor || saving">
                Update Service
              </button>
            </div>
          </div>
          <!--Delete Service button-->
          <div class="flex items-end">
            <button @click="submitDeleteService" type="button" class="btn btn-danger"
              :disabled="!user.isEditor">
              Delete Service
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
    <!-- Display Found Data -->
    <div class="form-grid">
      <!--List of Events table-->
      <div>
        <h2 class="section-title">List of Events</h2>
        <p class="section-hint">Click table row to view event details</p>
      </div>
      <div class="card overflow-x-auto sm:col-span-2 md:col-span-3">
        <table class="simple-table">
          <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Event Date</th>
              <th scope="col">Event Address</th>
            </tr>
          </thead>
          <tbody>
            <tr @click="openEvent(event._id)" @keyup.enter="openEvent(event._id)" tabindex="0"
              v-for="event in events" :key="event._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id"
              @mouseleave="hoverId = null">
              <td>{{ event.name }}</td>
              <td>{{ formatDate(event.date) }}</td>
              <td>{{ event.address.line1 }}</td>
            </tr>
            <tr v-if="!events.length">
              <td colspan="3" class="p-4 text-center text-gray-600">No events offer this service yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
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
import { useConfirm } from '../composables/useConfirm'
import { getServiceById, getEventsByServiceId, updateService, deleteService, messageOf } from '../api/api'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()
const confirm = useConfirm() // app-wide dialog, replaces window.confirm()

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
  const confirmed = await confirm({
    title: 'Delete service?',
    message: `"${service.value.name}" will be permanently removed. This cannot be undone.`,
    confirmLabel: 'Delete Service',
    danger: true
  })
  if (!confirmed) return
  try {
    const response = await deleteService(serviceId.value)
    toast.success(messageOf(response, 'Service deleted'))
    router.push({ name: 'findservice' })
  } catch (err) {
    toast.error(err.message)
  }
}
</script>
