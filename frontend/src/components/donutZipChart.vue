<!-- Doughnut chart of clients per ZIP code, used on the dashboard. -->
<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="canvasRef" role="img" aria-label="Clients by ZIP code"></canvas>
  </div>
</template>

<script setup>
// ---------------------------------------------------------------------------
// Composition API migration (task F1)
//   - props: { label, chartData }  -> defineProps()
//   - this.$refs.zipChart          -> const canvasRef = ref(null)
//   - mounted hook                    -> onMounted()
// Same fixes as barChart.vue: the chart now reacts to new props through
// watch(), is destroyed in onBeforeUnmount(), and no longer awaits a
// constructor.
// ---------------------------------------------------------------------------
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

const canvasRef = ref(null)
let chart = null // plain variable on purpose, see barChart.vue

onMounted(() => {
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: [...props.label],
      datasets: [{ borderWidth: 1, data: [...props.chartData] }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Clients by Zip Code' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

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
