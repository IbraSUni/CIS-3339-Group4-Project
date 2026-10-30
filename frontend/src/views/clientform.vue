<!-- This view allows a user to create client information. -->
<template>
  <div class="page">
    <!--Header-->
    <h1 class="page-title">
      Client Intake Form
    </h1>
    <div class="card card-body mt-6">
      <!-- form field -->
      <!-- @submit.prevent stops the submit event from reloading the page-->
      <form @submit.prevent="submitForm">
        <!-- grid container -->
        <div class="form-grid">
          <h2 class="section-title">Personal Details</h2>
          <!--First Name Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">First Name</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input type="text"
                class="form-control"
                v-model="client.firstName" />
            </label>
            <!-- Validation error messages -->
            <span v-if="v$.client.firstName.$error" class="field-error">
              First Name is required
            </span>
          </div>

          <!--Middle Name Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Middle Name</span>
              <input type="text"
                class="form-control"
                placeholder v-model="client.middleName" />
            </label>
          </div>

          <!--Last Name Input Field-->
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
          <!--Email Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Email</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input type="email"
                class="form-control"
                v-model="client.email" />
            </label>
            <!-- Validation error messages -->
            <span v-if="v$.client.email.$error" class="field-error">
              Valid Email is required
            </span>
          </div>
          <!-- Phone Number Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Phone Number</span>
              <span class="required-mark" aria-hidden="true">*</span>
              <input type="text"
                class="form-control"
                pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.primary" />
            </label>
            <!-- Validation error messages -->
            <span v-if="v$.client.phoneNumber.primary.$error" class="field-error">
              <span v-if="v$.client.phoneNumber.primary.required.$invalid">
                Phone Number is required
              </span>
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

          <!-- Alternative Phone Number Input Field -->
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
          <!-- Address 1 Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Address Line 1</span>
              <input type="text"
                class="form-control"
                v-model="client.address.line1" />
            </label>
          </div>

          <!-- Address 2 Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Address Line 2</span>
              <input type="text"
                class="form-control"
                v-model="client.address.line2" />
            </label>
          </div>

          <!-- City Input Field -->
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

          <!-- County Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">County</span>
              <input type="text"
                class="form-control"
                v-model="client.address.county" />
            </label>
          </div>

          <!-- Zip Code Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="form-label">Zip Code</span>
              <input type="text"
                class="form-control"
                v-model="client.address.zip" />
            </label>
          </div>
          <div></div>

          <!-- Add Client Submit Button -->
          <div class="flex items-end">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              Add Client
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
//   Before: data option { client }, setup() { v$ = useVuelidate() },
//           validations option { ... }, methods option { submitForm }.
//   After:  <script setup>
//   - data option: client          -> reactive(emptyClient())
//   - validations option          -> a plain `rules` object
//   - useVuelidate()         -> useVuelidate(rules, { client }); without the
//                               Options API, Vuelidate must be given the rules
//                               and the state explicitly
//   - this.$router           -> useRouter()
//   - toast.error(error)     -> toast.error(err.message) (readable text from
//                               the api.js interceptor, never [object Object])
// The route itself is editor-only (meta.requiresEditor in router/index.js).
// ---------------------------------------------------------------------------
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import { createClient, messageOf } from '../api/api'

const router = useRouter()
const toast = useToast()

// was data option: the new client's fields
const client = reactive({
  firstName: null,
  middleName: null,
  lastName: null,
  email: null,
  phoneNumber: {
    primary: null,
    alternate: null
  },
  address: {
    line1: null,
    line2: null,
    city: null,
    county: null,
    zip: null
  }
})

// was validations option
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

const submitting = ref(false)

// was method submitForm()
async function submitForm() {
  const isValid = await v$.value.$validate()
  if (!isValid) return // validation messages are shown next to each field

  submitting.value = true
  try {
    const response = await createClient(client)
    toast.success(messageOf(response, 'Client created'))
    router.push({ name: 'findclient' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>


