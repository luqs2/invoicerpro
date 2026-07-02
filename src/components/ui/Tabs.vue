<template>
  <TabsRoot
    v-model="model"
    class="tabs-root"
  >
    <TabsList class="tabs-list">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="tabs-trigger"
      >
        {{ tab.label }}
        <span
          v-if="tab.count != null"
          class="tab-badge"
        >{{ tab.count }}</span>
      </TabsTrigger>
    </TabsList>
    <slot />
  </TabsRoot>
</template>

<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger } from 'radix-vue'

interface Tab {
  value: string
  label: string
  count?: number | null
}

defineProps<{ tabs: Tab[] }>()
const model = defineModel<string>()
</script>

<style scoped>
.tabs-root { display: flex; flex-direction: column; gap: 0; }

.tabs-list {
  display: inline-flex;
  gap: 2px;
  background: #f4ede3;
  border-radius: 10px;
  padding: 3px;
}

.tabs-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #414846;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
  white-space: nowrap;
  outline: none;
}

.tabs-trigger:hover {
  color: #374151;
  background: rgba(255,255,255,.6);
}

.tabs-trigger[data-state="active"] {
  background: #F7F4EC;
  color: #1e1b15;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}

.tab-badge {
  background: #D6D0C2;
  color: #414846;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 0 5px;
  min-width: 18px;
  text-align: center;
}

.tabs-trigger[data-state="active"] .tab-badge {
  background: #cbe9e0;
  color: #08241f;
}

.dark .tabs-list { background: #1d201f; }
.dark .tabs-trigger { color: #c0c8c4; }
.dark .tabs-trigger:hover { color: #e1e3e1; background: rgba(255,255,255,.05); }
.dark .tabs-trigger[data-state="active"] { background: #111413; color: #e1e3e1; }
.dark .tab-badge { background: #404945; color: #c0c8c4; }
.dark .tabs-trigger[data-state="active"] .tab-badge { background: #a0d0c2; color: #F7F4EC; }
</style>
