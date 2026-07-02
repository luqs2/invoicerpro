<template>
  <span :class="['badge', `badge-${variant}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'success' | 'warning' | 'danger'
}>(), { variant: 'default' })
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.badge-default    { background: #EDE8DE; color: #414846; }
.badge-draft      { background: #f4ede3; color: #6B6558; }
.badge-sent       { background: #dbeafe; color: #1d4ed8; }
.badge-paid       { background: #d1fae5; color: #065f46; }
.badge-overdue    { background: #ffdad6; color: #A6432E; }
.badge-cancelled  { background: #EDE8DE; color: #414846; }
.badge-success    { background: #d1fae5; color: #065f46; }
.badge-warning    { background: #fef3c7; color: #92400e; }
.badge-danger     { background: #ffdad6; color: #93000a; }

.dark .badge-default    { background: #323534; color: #c0c8c4; }
.dark .badge-draft      { background: #323534; color: #c0c8c4; }
.dark .badge-sent       { background: #0c4a6e; color: #38bdf8; }
.dark .badge-paid       { background: #14532d; color: #4ade80; }
.dark .badge-overdue    { background: #450a0a; color: #fca5a5; }
.dark .badge-cancelled  { background: #323534; color: #c0c8c4; }
.dark .badge-success    { background: #14532d; color: #4ade80; }
.dark .badge-warning    { background: #451a03; color: #fbbf24; }
.dark .badge-danger     { background: #450a0a; color: #fca5a5; }
</style>
