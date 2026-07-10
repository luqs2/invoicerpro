<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderRadius?: number
  }[]
  height?: number
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map(ds => ({
    ...ds,
    backgroundColor: ds.backgroundColor || '#B5652D',
    borderRadius: ds.borderRadius || 6,
    barPercentage: 0.7,
  })),
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.datasets.length > 1,
      position: 'top' as const,
      labels: {
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        padding: 16,
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
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#414846' },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#414846' },
    },
  },
}
</script>

<template>
  <div :style="{ height: (height || 280) + 'px' }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
