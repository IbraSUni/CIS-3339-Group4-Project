<!-- This viewt allows for the creation of a new service -->
<template>
    <div class="page">
        <!--Header-->
        <h1 class="page-title">
            Create Service
        </h1>
        <div class="card card-body mt-6">
            <!--Form-->
            <!-- @submit.prevent stops the submit event from reloading the page-->
            <form @submit.prevent="handleSubmitForm">
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
                            <!-- Validation error messages -->
                            <span v-if="v$.service.name.$error" class="field-error">
                                Service Name is required
                            </span>
                        </label>
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

                <div class="form-grid mt-8 border-t border-zinc-100 pt-8">
                    <div></div>
                    <!-- form field: update service description -->
                    <div class="flex flex-col">
                        <label class="block">
                        <span class="form-label">Service Status</span>
                        <span class="required-mark" aria-hidden="true">*</span>
                        <div class="mt-1">
                            <label class="inline-flex items-center">
                                <input type="radio" class="form-radio text-brand-600 focus:ring-brand-500" value="Active"
                                    v-model="service.status">
                                <span class="ml-2">Active</span>
                            </label>
                            <label class="inline-flex items-center ml-6">
                                <input type="radio" class="form-radio text-brand-600 focus:ring-brand-500" value="Inactive"
                                    v-model="service.status">
                                <span class="ml-2">Inactive</span>
                            </label>
                        </div>
                    </label>
                    </div>
                </div>

                <!-- grid container -->
                <div class="form-grid">
                    <div></div>
                    <!-- Add Service submit button -->
                    <div class="flex items-end">
                        <button class="btn btn-primary" type="submit" :disabled="submitting">
                            Add Service
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
//   Before: data option { service }, setup() { v$ }, validations option,
//           methods option { handleSubmitForm }.
//   After:  <script setup>
//   - data option: service   -> reactive() (new services default to "Active")
//   - validations option    -> `rules` passed to useVuelidate(rules, { service })
//   - this.$router     -> useRouter()
//   - toast.error('Error creating new service:', error) passed the error as
//     the toast's options argument, so it was never shown; now the readable
//     err.message is displayed.
// The route is editor-only (meta.requiresEditor).
// ---------------------------------------------------------------------------
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { createService, messageOf } from '../api/api'

const router = useRouter()
const toast = useToast()

// was data option: service
const service = reactive({
  name: null,
  description: null,
  status: 'Active'
})

// was validations option
const rules = {
  service: {
    name: { required }
  }
}
const v$ = useVuelidate(rules, { service })

const submitting = ref(false)

// was method handleSubmitForm()
async function handleSubmitForm() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  submitting.value = true
  try {
    const response = await createService(service)
    toast.success(messageOf(response, 'Service created'))
    router.push({ name: 'findservice' })
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>
