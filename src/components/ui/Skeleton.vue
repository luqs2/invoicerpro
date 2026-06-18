<template>
  <div
    class="skeleton"
    :class="[
      `skeleton-${variant}`,
      { 'skeleton-rounded': rounded }
    ]"
    :style="{
      width: width,
      height: height,
    }"
  >
    <div class="skeleton-shimmer" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'text' | 'title' | 'avatar' | 'rect' | 'circle'
  width?: string
  height?: string
  rounded?: boolean
}>(), {
  variant: 'text',
  width: '100%',
  height: 'auto',
  rounded: false,
})
</script>

<style scoped>
.skeleton {
  background: #e2e8f0;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.skeleton-rounded { border-radius: 50%; }

.skeleton-text { height: 14px; }
.skeleton-title { height: 20px; }
.skeleton-avatar { width: 40px; height: 40px; border-radius: 10px; }
.skeleton-rect { height: 80px; }
.skeleton-circle { width: 40px; height: 40px; border-radius: 50%; }

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
