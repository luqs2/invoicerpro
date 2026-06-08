<template>
  <div class="tpl-card" :class="{ selected }">
    <div class="tpl-thumb" :style="{ background: template.secondary_color, color: template.primary_color }">◫</div>
    <div class="tpl-name">{{ template.name }}</div>
  </div>
</template>
<script setup lang="ts">
import type { InvoiceTemplate } from "@/types"
defineProps<{ template: InvoiceTemplate; selected: boolean }>()
</script>
<style scoped>
.tpl-card{border:2px solid var(--ion-border-color);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
.tpl-card.selected{border-color:#c8f04a;}
.tpl-thumb{height:80px;display:flex;align-items:center;justify-content:center;font-size:28px;}
.tpl-name{padding:8px;font-size:12px;font-weight:600;background:var(--ion-card-background);}
</style>
