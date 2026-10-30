<!-- This view allows for the creation of a new event -->
<template>
  <div class="page">
    <div>
      <!--Header-->
      <h1 class="page-title">
        Create New Event
      </h1>
    </div>
    <div class="card card-body mt-6">
      <!--Form-->
      <!-- @submit.prevent stops the submit event from reloading the page-->
      <form @submit.prevent="handleSubmitForm">
        <!-- grid container -->
        <div class="form-grid">
          <h2 class="section-title">Event Details</h2>

          <!-- Event Name Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Event Name</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input type="text"
                class="form-control"
                v-model="event.name" />
            </label>
            <!-- Validation error messages -->
            <span v-if="v$.event.name.$error" class="field-error">
              Event Name is required
            </span>
          </div>

          <!-- Date input field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Date</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input
                class="form-control"
                v-model="event.date" type="date" />
            </label>
            <!-- Validation error messages -->
            <span v-if="v$.event.date.$error" class="field-error">
              <span v-if="v$.event.date.required.$invalid">
                Event Date is required
              </span>
              <span v-else-if="!v$.event.date.required.$invalid && v$.event.date.validDate.$invalid">
                Event Date must be a valid date
              </span>
              <span
                v-else-if="!v$.event.date.required.$invalid && !v$.event.date.validDate.$invalid && v$.event.date.notBeforeToday.$invalid">
                New Event Date cannot be in the past.
              </span>
            </span>
          </div>

          <div></div>
          <div></div>
          <!-- Description input field -->
          <div class="flex col-span-2 flex-col">
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
              <ul v-if="activeServices.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <li v-for="service in activeServices" :key="service._id" :data-service-id="service._id"
                  class="rounded-lg border border-zinc-200 px-3 py-2 transition-colors hover:bg-zinc-50">
                  <label class="block w-full h-full">
                    <input type="checkbox" :id="service._id" :value="service._id"
                      :checked="event.services.includes(service._id)" v-model="event.services"
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
          <!-- Zip code field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Zip Code</span>
              <input type="text"
                class="form-control"
                placeholder v-model="event.address.zip" />
            </label>
          </div>
        </div>

        <!--Add New Event submit button-->
        <div class="form-grid mt-8 border-t border-zinc-100 pt-8">
          <div></div>
          <div class="flex items-end">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              Add New Event
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   Before: data option { event, activeServices, openDescriptions },
//           setup() { v$ }, validations option with two inline custom validators,
//           mounted hook loading services, methods option { handleSubmitForm }.
//   After:  <script setup>
//   - data option: event           -> reactive()
//   - activeServices         -> ref([])
//   - openDescriptions       -> removed (declared but never used)
//   - validations option          -> `rules`, passed to useVuelidate(rules, { event })
//   - mounted hook              -> onMounted(loadActiveServices)
//   - this.$router           -> useRouter()
// Fixed during the migration: the Description textarea had no v-model, so
// anything typed into it was never saved. It is now bound to event.description.
// The route is editor-only (meta.requiresEditor).
// ---------------------------------------------------------------------------
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { getServices, createEvent, messageOf } from '../api/api'

const router = useRouter()
const toast = useToast()

// was data option: event
const event = reactive({
  name: null,
  description: null,
  date: null,
  services: [],
  address: {
    line1: null,
    line2: null,
    city: null,
    county: null,
    zip: null
  },
  attendees: []
})

// was data option: activeServices: only Active services can be offered at an event
const activeServices = ref([])

// ---- validation (was validations option) ----
const validDate = (value) => !helpers.req(value) || !Number.isNaN(new Date(value).getTime())

// A new event cannot be scheduled in the past. The comparison is on the
// YYYY-MM-DD string from <input type="date">, in the user's local time zone.
const notBeforeToday = (value) => {
  if (!helpers.req(value)) return true
  const now = new Date()
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  return value >= today
}

const rules = {
  event: {
    name: { required },
    date: { required, validDate, notBeforeToday }
  }
}
const v$ = useVuelidate(rules, { event })

const submitting = ref(false)

// was mounted hook
async function loadActiveServices() {
  try {
    const services = await getServices()
    activeServices.value = services.filter((service) => service.status === 'Active')
  } catch (err) {
    toast.error(`Could not load services: ${err.message}`)
  }
}
onMounted(loadActiveServices)

// was method handleSubmitForm()
async function handleSubmitForm() {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toast.error('Please fix the highlighted fields')
    return
  }

  submitting.value = true
  try {
    const response = await createEvent(event)
    toast.success(messageOf(response, 'Event created'))
    router.push({ name: 'findevents' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>
