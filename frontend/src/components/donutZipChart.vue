<!-- Doughnut chart of clients per ZIP code, used on the dashboard. -->
<template>
  <div class="mx-auto w-full max-w-xs">
    <canvas ref="canvasRef" role="img" aria-label="Clients by ZIP code"></canvas>
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

// One hue (the brand red) in several strengths, so the chart stays on-palette
// however many ZIP codes there are.
const palette = ['#c8102e', '#dc3a50', '#ec9aa5', '#a80d26', '#f6c7cd', '#8a0b20', '#5c0715', '#fbe3e6']
const colorsFor = (count) => Array.from({ length: count }, (_, i) => palette[i % palette.length])

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
      datasets: [{ data: [...props.chartData], backgroundColor: colorsFor(props.chartData.length), borderColor: '#ffffff', borderWidth: 2 }]
    },
    options: {
      plugins: {
        legend: { display: true, position: 'bottom', labels: { boxWidth: 12 } },
        title: { display: false }
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
    chart.data.datasets[0].backgroundColor = colorsFor(values.length)
    chart.update()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>
