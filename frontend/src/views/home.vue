<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />

      <!-- ===================== Event attendance ===================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h2 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
            Events Attendance
          </h2>
          <p class="text-center text-gray-600 mt-2">Events from the last two months</p>

          <!-- Loading state -->
          <div v-if="attendance.loading.value" class="mt-10" role="status">
            <p class="text-2xl font-bold text-center text-gray-500 animate-pulse">Loading attendance...</p>
          </div>

          <!-- Error state, with retry -->
          <div v-else-if="attendance.error.value" class="mt-10 bg-red-50 border border-red-200 rounded p-6 text-center"
            role="alert">
            <p class="text-lg font-bold text-red-900">Could not load attendance</p>
            <p class="text-red-800 mt-1">{{ attendance.error.value }}</p>
            <button class="mt-4 bg-red-700 text-white rounded" @click="attendance.execute()">Retry</button>
          </div>

          <!-- Empty state -->
          <div v-else-if="!recentEvents.length" class="flex justify-center mt-10 text-gray-600">
            No events in the last two months.
          </div>

          <!-- Data -->
          <template v-else>
            <table class="min-w-full shadow-md rounded mt-6">
              <thead class="bg-gray-50 text-xl">
                <tr class="p-4 text-left">
                  <th class="p-4 text-left">Event Name</th>
                  <th class="p-4 text-left">Event Date</th>
                  <th class="p-4 text-left">Number of Attendees</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <tr v-for="event in recentEvents" :key="event._id" class="cursor-pointer hover:bg-red-50" tabindex="0"
                  @click="openEvent(event._id)" @keyup.enter="openEvent(event._id)">
                  <td class="p-2 text-left">{{ event.name }}</td>
                  <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                  <td class="p-2 text-left">{{ event.attendees.length }}</td>
                </tr>
              </tbody>
            </table>
            <AttendanceChart :label="attendanceLabels" :chart-data="attendanceCounts" />
          </template>
        </div>
      </div>

      <!-- ===================== Clients by ZIP ===================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h2 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
            Clients by Zip Code
          </h2>

          <div v-if="zipCounts.loading.value" class="mt-10" role="status">
            <p class="text-2xl font-bold text-center text-gray-500 animate-pulse">Loading client ZIP codes...</p>
          </div>

          <div v-else-if="zipCounts.error.value" class="mt-10 bg-red-50 border border-red-200 rounded p-6 text-center"
            role="alert">
            <p class="text-lg font-bold text-red-900">Could not load clients by ZIP code</p>
            <p class="text-red-800 mt-1">{{ zipCounts.error.value }}</p>
            <button class="mt-4 bg-red-700 text-white rounded" @click="zipCounts.execute()">Retry</button>
          </div>

          <div v-else-if="!zips.length" class="flex justify-center mt-10 text-gray-600">
            No clients with a ZIP code yet.
          </div>

          <template v-else>
            <table class="min-w-full shadow-md rounded mt-6">
              <thead class="bg-gray-50 text-xl">
                <tr class="p-4 text-left">
                  <th class="p-4 text-left">Zip Number</th>
                  <th class="p-4 text-left">Client Count</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300">
                <tr v-for="zip in zips" :key="zip._id">
                  <td class="p-2 text-left">{{ zip._id }}</td>
                  <td class="p-2 text-left">{{ zip.count }}</td>
                </tr>
              </tbody>
            </table>
            <div class="flex justify-center mt-10">
              <ZipChart :label="zipLabels" :chart-data="zipValues" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1) + useApi (task F2)
//   Before: data() held 10 fields (recentEvents, zips, labels, chartData,
//           loading, error, zipLoading, zipError, ...) and two methods that
//           each hand-rolled the same try/catch/loading logic, mounted() called
//           both, and formatDate() was a local method.
//   After:
//   - each request is one useApi() call that owns its own data/loading/error
//   - chart labels and values are computed() from the API data instead of
//     being copied into separate data() fields
//   - mounted()        -> onMounted()
//   - formatDate()     -> shared utils/formatDate.js
//   - components: {}   -> imported components are usable directly
// The old error box branched on err.response / err.request to build a
// title + message. That translation now happens once, in the api.js
// interceptor, so this view only displays error.value.
// The template also fixes the old render race: `loading` started as false, so
// the chart could render before the data arrived. useApi sets loading to true
// as soon as execute() runs (on mount), and the chart only renders in the
// data branch.
// ---------------------------------------------------------------------------
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'
import { formatDate } from '../utils/formatDate'

const router = useRouter()

// Each section keeps its whole useApi() object so the template reads
// attendance.loading.value, attendance.error.value, attendance.execute().
const attendance = useApi(() => getAttendance())
const zipCounts = useApi(() => getClientsByZipCode())

// was data(): recentEvents, labels, chartData
const recentEvents = computed(() => attendance.data.value ?? [])
const attendanceLabels = computed(() => recentEvents.value.map((e) => `${e.name} (${formatDate(e.date)})`))
const attendanceCounts = computed(() => recentEvents.value.map((e) => e.attendees.length))

// was data(): zips, zipLabels, zipChartData
const zips = computed(() => zipCounts.data.value ?? [])
const zipLabels = computed(() => zips.value.map((z) => z._id))
const zipValues = computed(() => zips.value.map((z) => z.count))

// was mounted(): this.getAttendanceData(); this.getZipData()
onMounted(() => {
  attendance.execute()
  zipCounts.execute()
})

// The template had @click="editEvent(event._id)" but no editEvent method
// existed, so clicking a row threw an error. Rows now open the event.
function openEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}
</script>
