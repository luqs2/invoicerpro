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
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  white-space: nowrap;
}
.badge-default    { background: #f1f5f9; color: #64748b; }
.badge-draft      { background: #f1f5f9; color: #64748b; }
.badge-sent       { background: #dbeafe; color: #1d4ed8; }
.badge-paid       { background: #d1fae5; color: #065f46; }
.badge-overdue    { background: #fee2e2; color: #991b1b; }
.badge-cancelled  { background: #f1f5f9; color: #94a3b8; }
.badge-success    { background: #d1fae5; color: #065f46; }
.badge-warning    { background: #fef3c7; color: #92400e; }
.badge-danger     { background: #fee2e2; color: #991b1b; }

.dark .badge-default    { background: #334155; color: #94a3b8; }
.dark .badge-draft      { background: #334155; color: #94a3b8; }
.dark .badge-sent       { background: #1e3a5f; color: #60a5fa; }
.dark .badge-paid       { background: #064e3b; color: #34d399; }
.dark .badge-overdue    { background: #450a0a; color: #f87171; }
.dark .badge-cancelled  { background: #334155; color: #64748b; }
.dark .badge-success    { background: #064e3b; color: #34d399; }
.dark .badge-warning    { background: #451a03; color: #fbbf24; }
.dark .badge-danger     { background: #450a0a; color: #f87171; }
</style>
