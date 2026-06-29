<template>
  <div
    class="tpl-card"
    :class="{ selected }"
  >
    <div class="tpl-thumb">
      <!-- Classic -->
      <svg
        v-if="template.header_layout === 'classic'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="8"
          y="10"
          width="16"
          height="16"
          rx="3"
          :fill="template.primary_color"
          opacity="0.85"
        />
        <rect
          x="8"
          y="30"
          width="28"
          height="4"
          rx="1.5"
          fill="#1e293b"
          opacity="0.7"
        />
        <rect
          x="8"
          y="37"
          width="20"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.5"
        />
        <rect
          x="80"
          y="10"
          width="32"
          height="7"
          rx="2"
          :fill="template.primary_color"
        />
        <rect
          x="86"
          y="22"
          width="26"
          height="5"
          rx="1.5"
          fill="#1e293b"
          opacity="0.5"
        />
        <rect
          x="88"
          y="30"
          width="22"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="8"
          y="44"
          width="104"
          height="1.5"
          rx="0.75"
          :fill="template.primary_color"
        />
      </svg>
      <!-- Inline -->
      <svg
        v-else-if="template.header_layout === 'inline'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="8"
          y="16"
          width="20"
          height="20"
          rx="3"
          :fill="template.primary_color"
          opacity="0.85"
        />
        <rect
          x="32"
          y="20"
          width="30"
          height="5"
          rx="1.5"
          fill="#1e293b"
          opacity="0.7"
        />
        <rect
          x="32"
          y="28"
          width="20"
          height="3"
          rx="1"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="78"
          y="14"
          width="34"
          height="7"
          rx="2"
          :fill="template.primary_color"
        />
        <rect
          x="82"
          y="25"
          width="28"
          height="4"
          rx="1.5"
          fill="#1e293b"
          opacity="0.4"
        />
        <rect
          x="84"
          y="33"
          width="24"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.35"
        />
        <rect
          x="8"
          y="44"
          width="104"
          height="1.5"
          rx="0.75"
          :fill="template.primary_color"
        />
      </svg>
      <!-- Centered -->
      <svg
        v-else-if="template.header_layout === 'centered'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="52"
          y="6"
          width="16"
          height="16"
          rx="3"
          :fill="template.primary_color"
          opacity="0.85"
        />
        <rect
          x="40"
          y="26"
          width="40"
          height="4"
          rx="1.5"
          fill="#1e293b"
          opacity="0.7"
        />
        <rect
          x="44"
          y="33"
          width="32"
          height="7"
          rx="2"
          :fill="template.primary_color"
          opacity="0.9"
        />
        <rect
          x="48"
          y="43"
          width="24"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.4"
        />
      </svg>
      <!-- Minimal -->
      <svg
        v-else-if="template.header_layout === 'minimal'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="8"
          y="14"
          width="36"
          height="5"
          rx="1.5"
          fill="#1e293b"
          opacity="0.8"
        />
        <rect
          x="8"
          y="23"
          width="22"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.45"
        />
        <rect
          x="80"
          y="13"
          width="28"
          height="5"
          rx="1"
          :fill="template.primary_color"
          opacity="0.7"
        />
        <rect
          x="82"
          y="23"
          width="24"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="8"
          y="33"
          width="104"
          height="1"
          rx="0.5"
          :fill="template.primary_color"
          opacity="0.4"
        />
      </svg>
      <!-- Bold -->
      <svg
        v-else-if="template.header_layout === 'bold'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="0"
          y="0"
          width="120"
          height="36"
          rx="4"
          :fill="template.secondary_color"
        />
        <rect
          x="8"
          y="8"
          width="20"
          height="20"
          rx="3"
          :fill="template.primary_color"
          opacity="0.9"
        />
        <rect
          x="32"
          y="12"
          width="26"
          height="5"
          rx="1.5"
          fill="white"
          opacity="0.8"
        />
        <rect
          x="32"
          y="21"
          width="18"
          height="3"
          rx="1"
          fill="white"
          opacity="0.4"
        />
        <rect
          x="78"
          y="8"
          width="34"
          height="8"
          rx="2"
          :fill="template.primary_color"
          opacity="0.85"
        />
        <rect
          x="82"
          y="20"
          width="28"
          height="4"
          rx="1.5"
          fill="white"
          opacity="0.5"
        />
        <rect
          x="84"
          y="28"
          width="24"
          height="2.5"
          rx="1"
          fill="white"
          opacity="0.3"
        />
      </svg>
      <!-- Split -->
      <svg
        v-else-if="template.header_layout === 'split'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="0"
          y="0"
          width="5"
          height="52"
          rx="2"
          :fill="template.primary_color"
        />
        <rect
          x="12"
          y="16"
          width="18"
          height="18"
          rx="3"
          :fill="template.primary_color"
          opacity="0.2"
        />
        <rect
          x="12"
          y="17"
          width="18"
          height="18"
          rx="3"
          :fill="template.primary_color"
          opacity="0.6"
        />
        <rect
          x="34"
          y="20"
          width="26"
          height="5"
          rx="1.5"
          fill="#1e293b"
          opacity="0.7"
        />
        <rect
          x="34"
          y="28"
          width="18"
          height="3"
          rx="1"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="80"
          y="14"
          width="32"
          height="7"
          rx="2"
          :fill="template.secondary_color"
        />
        <rect
          x="83"
          y="25"
          width="27"
          height="4"
          rx="1.5"
          fill="#1e293b"
          opacity="0.4"
        />
        <rect
          x="85"
          y="33"
          width="23"
          height="2.5"
          rx="1"
          fill="#94a3b8"
          opacity="0.35"
        />
        <rect
          x="8"
          y="48"
          width="104"
          height="1"
          rx="0.5"
          :fill="template.secondary_color"
          opacity="0.15"
        />
      </svg>
      <!-- Professional -->
      <svg
        v-else-if="template.header_layout === 'professional'"
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="0"
          y="0"
          width="120"
          height="18"
          rx="0"
          :fill="template.primary_color"
        />
        <rect
          x="8"
          y="5"
          width="14"
          height="8"
          rx="2"
          fill="white"
          opacity="0.9"
        />
        <rect
          x="26"
          y="6"
          width="22"
          height="3"
          rx="1"
          fill="white"
          opacity="0.8"
        />
        <rect
          x="26"
          y="11"
          width="16"
          height="2"
          rx="0.5"
          fill="white"
          opacity="0.5"
        />
        <rect
          x="80"
          y="5"
          width="32"
          height="3"
          rx="1"
          fill="white"
          opacity="0.7"
        />
        <rect
          x="82"
          y="10"
          width="28"
          height="2"
          rx="0.5"
          fill="white"
          opacity="0.4"
        />
        <rect
          x="8"
          y="22"
          width="20"
          height="3"
          rx="1"
          fill="#1e293b"
          opacity="0.6"
        />
        <rect
          x="8"
          y="27"
          width="14"
          height="2"
          rx="0.5"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="72"
          y="22"
          width="40"
          height="3"
          rx="1"
          fill="#1e293b"
          opacity="0.6"
        />
        <rect
          x="74"
          y="27"
          width="36"
          height="2"
          rx="0.5"
          fill="#94a3b8"
          opacity="0.4"
        />
        <rect
          x="8"
          y="33"
          width="104"
          height="0.75"
          rx="0.375"
          fill="#e2e8f0"
        />
        <rect
          x="8"
          y="36"
          width="30"
          height="2"
          rx="0.5"
          fill="#94a3b8"
          opacity="0.3"
        />
        <rect
          x="8"
          y="40"
          width="104"
          height="6"
          rx="1"
          :fill="template.primary_color"
          opacity="0.08"
        />
        <rect
          x="8"
          y="42"
          width="24"
          height="2"
          rx="0.5"
          fill="#1e293b"
          opacity="0.3"
        />
        <rect
          x="36"
          y="42"
          width="20"
          height="2"
          rx="0.5"
          fill="#1e293b"
          opacity="0.2"
        />
        <rect
          x="62"
          y="42"
          width="18"
          height="2"
          rx="0.5"
          fill="#1e293b"
          opacity="0.2"
        />
        <rect
          x="86"
          y="41"
          width="26"
          height="4"
          rx="1"
          :fill="template.primary_color"
          opacity="0.9"
        />
      </svg>
      <!-- Fallback -->
      <svg
        v-else
        viewBox="0 0 120 52"
        fill="none"
      >
        <rect
          x="8"
          y="8"
          width="104"
          height="36"
          rx="4"
          fill="#f1f5f9"
        />
        <rect
          x="36"
          y="20"
          width="48"
          height="4"
          rx="1.5"
          fill="#cbd5e1"
        />
      </svg>
    </div>
    <div class="tpl-info">
      <div class="tpl-name">
        {{ template.name }}
      </div>
      <div class="tpl-desc">
        {{ layoutDesc }}
      </div>
    </div>
    <div
      v-if="selected"
      class="tpl-check"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <circle
          cx="7"
          cy="7"
          r="7"
          fill="#6366f1"
        />
        <path
          d="M4 7l2 2 4-4"
          stroke="white"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceTemplate } from '@/types'

const props = defineProps<{ template: InvoiceTemplate; selected: boolean }>()

const layoutDesc = computed(() => {
  const map: Record<string, string> = {
    classic:      'Logo stacked, info right',
    inline:       'Logo + name side by side',
    centered:     'Everything centered',
    minimal:      'Text only, clean rule',
    bold:         'Full-width colour banner',
    split:        'Accent sidebar strip',
    professional: 'Full details with bank & terms',
  }
  return map[props.template.header_layout] ?? ''
})
</script>
<style scoped>
.tpl-card {
  position: relative;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, transform .1s;
  background: #ffffff;
}
.tpl-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(99,102,241,.08);
}
.tpl-card.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.tpl-thumb {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  padding: 12px;
}
.tpl-thumb svg {
  width: 100%;
  height: 100%;
}

.tpl-info {
  padding: 12px 14px;
}

.tpl-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
}

.tpl-desc {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

.tpl-check {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
