<!-- This is the home view - which shows a dashboard -->
<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Event attendance over the last two months and where your clients live.</p>
      </div>
    </div>

    <!-- Summary numbers, computed from the same two API calls as the sections below -->
    <dl class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="card card-body">
        <dt class="text-sm text-zinc-600">{{ stat.label }}</dt>
        <dd class="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
          <span v-if="stat.loading" class="inline-block h-8 w-12 animate-pulse rounded bg-zinc-100"></span>
          <span v-else>{{ stat.value }}</span>
        </dd>
      </div>
    </dl>

    <div class="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-5">
      <!-- ===================== Event attendance ===================== -->
      <section class="xl:col-span-3" aria-labelledby="attendance-title">
        <h2 id="attendance-title" class="section-title">Events Attendance</h2>
        <p class="section-hint">Click an event to open it.</p>
        <div class="mt-3">
          <TableSkeleton v-if="attendance.loading.value" :columns="3" :rows="5" label="Loading attendance" />
          <StatePanel v-else-if="attendance.error.value" variant="error" title="Could not load attendance"
            :message="attendance.error.value">
            <button type="button" class="btn btn-primary" @click="attendance.execute()">Retry</button>
          </StatePanel>
          <StatePanel v-else-if="!recentEvents.length" title="No events in the last two months"
            message="Events dated within the last two months will show up here." icon="event_busy" />
          <div v-else class="card overflow-hidden">
            <div class="border-b border-zinc-100 p-4">
              <AttendanceChart :label="attendanceLabels" :chart-data="attendanceCounts" />
            </div>
            <table class="simple-table">
              <thead>
                <tr>
                  <th scope="col">Event Name</th>
                  <th scope="col">Event Date</th>
                  <th scope="col" class="text-right">Number of Attendees</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in recentEvents" :key="event._id" tabindex="0" @click="openEvent(event._id)"
                  @keyup.enter="openEvent(event._id)">
                  <td class="font-medium">{{ event.name }}</td>
                  <td>{{ formatDate(event.date) }}</td>
                  <td class="text-right tabular-nums">{{ event.attendees.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ===================== Clients by ZIP ===================== -->
      <section class="xl:col-span-2" aria-labelledby="zip-title">
        <h2 id="zip-title" class="section-title">Clients by Zip Code</h2>
        <p class="section-hint">Clients with a ZIP code on file.</p>
        <div class="mt-3">
          <TableSkeleton v-if="zipCounts.loading.value" :columns="2" :rows="5" label="Loading client ZIP codes" />
          <StatePanel v-else-if="zipCounts.error.value" variant="error" title="Could not load clients by ZIP code"
            :message="zipCounts.error.value">
            <button type="button" class="btn btn-primary" @click="zipCounts.execute()">Retry</button>
          </StatePanel>
          <StatePanel v-else-if="!zips.length" title="No clients with a ZIP code yet"
            message="Add a ZIP code to a client's address to see it here." icon="location_off" />
          <div v-else class="card overflow-hidden">
            <div class="flex justify-center border-b border-zinc-100 p-4">
              <ZipChart :label="zipLabels" :chart-data="zipValues" />
            </div>
            <table class="simple-table">
              <thead>
                <tr>
                  <th scope="col">Zip Number</th>
                  <th scope="col" class="text-right">Client Count</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="zip in zips" :key="zip._id">
                  <td class="font-medium">{{ zip._id }}</td>
                  <td class="text-right tabular-nums">{{ zip.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1) + useApi (task F2)
//   Before: data option held 10 fields (recentEvents, zips, labels, chartData,
//           loading, error, zipLoading, zipError, ...) and two methods that
//           each hand-rolled the same try/catch/loading logic, mounted hook called
//           both, and formatDate() was a local method.
//   After:
//   - each request is one useApi() call that owns its own data/loading/error
//   - chart labels and values are computed() from the API data instead of
//     being copied into separate data option fields
//   - mounted hook        -> onMounted()
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
import TableSkeleton from '../components/TableSkeleton.vue'
import StatePanel from '../components/StatePanel.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'
import { formatDate } from '../utils/formatDate'

const router = useRouter()

// Each section keeps its whole useApi() object so the template reads
// attendance.loading.value, attendance.error.value, attendance.execute().
const attendance = useApi(() => getAttendance())
const zipCounts = useApi(() => getClientsByZipCode())

// was data option: recentEvents, labels, chartData
const recentEvents = computed(() => attendance.data.value ?? [])
// Event names only; the dates are in the table under the chart.
const attendanceLabels = computed(() => recentEvents.value.map((e) => e.name))
const attendanceCounts = computed(() => recentEvents.value.map((e) => e.attendees.length))

// was data option: zips, zipLabels, zipChartData
const zips = computed(() => zipCounts.data.value ?? [])
const zipLabels = computed(() => zips.value.map((z) => z._id))
const zipValues = computed(() => zips.value.map((z) => z.count))

// Summary tiles: every number is derived from the two API results above.
const stats = computed(() => [
  { label: 'Events in the last 2 months', value: recentEvents.value.length, loading: attendance.loading.value },
  {
    label: 'Total attendance',
    value: attendanceCounts.value.reduce((sum, n) => sum + n, 0),
    loading: attendance.loading.value
  },
  { label: 'ZIP codes served', value: zips.value.length, loading: zipCounts.loading.value },
  { label: 'Clients with a ZIP code', value: zipValues.value.reduce((sum, n) => sum + n, 0), loading: zipCounts.loading.value }
])

// was mounted hook: this.getAttendanceData(); this.getZipData()
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
