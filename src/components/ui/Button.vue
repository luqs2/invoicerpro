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
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  outline: none;
}

.btn:focus-visible { box-shadow: 0 0 0 3px rgba(8,36,31,.25); }
.btn:active:not(:disabled) { transform: scale(0.98); }
.btn:disabled { opacity: .55; cursor: not-allowed; }

/* Sizes */
.btn-sm { height: 32px; padding: 0 12px; font-size: 12px; border-radius: 8px; }
.btn-md { height: 44px; padding: 0 16px; font-size: 14px; }
.btn-lg { height: 48px; padding: 0 22px; font-size: 15px; border-radius: 14px; font-weight: 700; }

/* Variants */
.btn-primary {
  background: #1f3a34;
  color: #ffffff;
}
.btn-primary:hover:not(:disabled) { background: #08241f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(8,36,31,.25); }

.btn-secondary {
  background: #EDE8DE;
  color: #1e1b15;
}
.btn-secondary:hover:not(:disabled) { background: #D6D0C2; }

.btn-outline {
  background: transparent;
  color: #1e1b15;
  border: 1.5px solid #D6D0C2;
}
.btn-outline:hover:not(:disabled) { background: #F7F4EC; border-color: #08241f; color: #08241f; }

.btn-ghost {
  background: transparent;
  color: #414846;
}
.btn-ghost:hover:not(:disabled) { background: #EDE8DE; color: #1e1b15; }

.btn-danger {
  background: #ffdad6;
  color: #93000a;
  border: 1.5px solid #ff8a80;
}
.btn-danger:hover:not(:disabled) { background: #ff8a80; }

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
