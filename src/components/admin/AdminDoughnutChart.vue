<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
  height?: number
}>()

const defaultColors = [
  '#08241f', '#B5652D', '#16a34a', '#d97706', '#dc2626',
  '#7c3aed', '#0ea5e9', '#64748b',
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.colors || defaultColors.slice(0, props.data.length),
    borderWidth: 0,
    hoverOffset: 6,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        padding: 12,
        generateLabels: (chart: any) => {
          const data = chart.data
          return data.labels.map((label: string, i: number) => ({
            text: `${label} (${data.datasets[0].data[i]})`,
            fillStyle: data.datasets[0].backgroundColor[i],
            strokeStyle: 'transparent',
            pointStyle: 'circle',
            index: i,
          }))
        },
      },
    },
    tooltip: {
      backgroundColor: '#1e1b15',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8,
    },
  },
}
</script>

<template>
  <div :style="{ height: (height || 280) + 'px' }">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
