<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :disabled="disabled || loading"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-loading': loading }]"
    v-bind="$attrs"
  >
    <span
      v-if="loading"
      class="btn-spinner"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  href?: string
}>(), {
  variant: 'primary',
  size: 'md',
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-weight: 600;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s, transform .1s, background .12s, border-color .12s;
  white-space: nowrap;
  outline: none;
}

.btn:focus-visible { box-shadow: 0 0 0 3px rgba(99,102,241,.25); }
.btn:active:not(:disabled) { transform: scale(.98); }
.btn:disabled { opacity: .55; cursor: not-allowed; }

/* Sizes */
.btn-sm { height: 32px; padding: 0 12px; font-size: 12px; border-radius: 7px; }
.btn-md { height: 38px; padding: 0 16px; font-size: 14px; }
.btn-lg { height: 46px; padding: 0 22px; font-size: 15px; border-radius: 11px; font-weight: 700; }

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}
.btn-primary:hover:not(:disabled) { opacity: .9; }

.btn-secondary {
  background: #f1f5f9;
  color: #374151;
}
.btn-secondary:hover:not(:disabled) { background: #e2e8f0; }

.btn-outline {
  background: transparent;
  color: #374151;
  border: 1.5px solid #e2e8f0;
}
.btn-outline:hover:not(:disabled) { background: #f8fafc; border-color: #c7d2fe; color: #4f46e5; }

.btn-ghost {
  background: transparent;
  color: #64748b;
}
.btn-ghost:hover:not(:disabled) { background: #f1f5f9; color: #374151; }

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1.5px solid #fecaca;
}
.btn-danger:hover:not(:disabled) { background: #fecaca; }

/* Spinner */
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
