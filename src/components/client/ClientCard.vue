<template>
  <div
    class="client-card"
    @click="go"
  >
    <div class="card-top">
      <div class="avatar">
        {{ getInitials(client.name) }}
      </div>
      <ChevronRight
        :size="16"
        class="card-chevron"
      />
    </div>
    <div class="card-body">
      <p class="client-name">
        {{ client.name }}
      </p>
      <p class="client-email">
        {{ client.email }}
      </p>
      <p
        v-if="client.company"
        class="client-company"
      >
        {{ client.company }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { useRouter } from 'vue-router'
import type { Client } from '@/types'
import { useFormatters } from '@/composables/useFormatters'

const { getInitials } = useFormatters()
const router = useRouter()
const props = defineProps<{ client: Client }>()

function go() {
  router.push(`/app/clients/${props.client.id}`)
}
</script>

<style scoped>
.client-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow .15s, transform .1s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

.client-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.client-card:active { transform: scale(.98); }

.card-top { display: flex; justify-content: space-between; align-items: flex-start; }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  flex-shrink: 0;
}

.card-chevron { color: #cbd5e1; margin-top: 2px; }
.card-body { display: flex; flex-direction: column; gap: 2px; }

.client-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-email {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-company {
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  margin: 4px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .client-card { background: #1e293b; border-color: #334155; }
.dark .client-name { color: #f1f5f9; }
.dark .client-email { color: #94a3b8; }
.dark .card-chevron { color: #475569; }
</style>
