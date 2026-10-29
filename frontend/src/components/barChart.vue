<!-- Bar chart of attendance per event, used on the dashboard. -->
<template>
  <div>
    <canvas class="p-10" ref="canvasRef" role="img" aria-label="Attendance per event"></canvas>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   - props: { label, chartData }  -> defineProps()
//   - this.$refs.attendanceChart   -> const canvasRef = ref(null)
//   - mounted()                    -> onMounted()
// Behaviour fixed during the migration:
//   - The old component built the chart once and never looked at its props
//     again. A watch() now pushes new labels/data into the existing chart.
//   - The Chart.js instance was never destroyed, leaking the canvas and its
//     listeners on every visit to the dashboard. onBeforeUnmount() destroys it.
//   - `await new Chart(...)` awaited a constructor for no reason; removed.
// ---------------------------------------------------------------------------
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables, Colors } from 'chart.js'

Chart.register(...registerables, Colors)

const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

const canvasRef = ref(null)
// The Chart.js instance is deliberately NOT reactive: Vue proxies would make
// Chart.js slow and can break its internal identity checks.
let chart = null

onMounted(() => {
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: [...props.label],
      datasets: [{ borderWidth: 1, data: [...props.chartData] }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Attendance Chart' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// Re-draw when the parent passes new data (for example after a retry).
watch(
  () => [props.label, props.chartData],
  ([labels, values]) => {
    if (!chart) return
    chart.data.labels = [...labels]
    chart.data.datasets[0].data = [...values]
    chart.update()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>
