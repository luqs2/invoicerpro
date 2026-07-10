<script setup lang="ts">
import { TrendingUp, TrendingDown } from '@lucide/vue'

defineProps<{
  icon: any
  label: string
  value: string | number
  trend?: number
  color?: string
}>()
</script>

<template>
  <div class="admin-stat-card">
    <div class="stat-icon" :style="{ background: (color || '#B5652D') + '15', color: color || '#B5652D' }">
      <component :is="icon" :size="20" />
    </div>
    <div class="stat-content">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
      <span v-if="trend !== undefined" class="stat-trend" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
        <TrendingUp v-if="trend >= 0" :size="12" />
        <TrendingDown v-else :size="12" />
        {{ Math.abs(trend) }}% vs last month
      </span>
    </div>
  </div>
</template>

<style scoped>
.admin-stat-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.dark .admin-stat-card {
  background: #1d201f;
  border-color: #404945;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #414846;
  font-weight: 500;
}
.dark .stat-label { color: #c0c8c4; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e1b15;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.5px;
}
.dark .stat-value { color: #e1e3e1; }

.stat-trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.trend-up { color: #16a34a; }
.trend-down { color: #dc2626; }
</style>
