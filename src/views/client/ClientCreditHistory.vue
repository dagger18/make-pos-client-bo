<script setup>
import ClientService from '@/services/ClientService'
import { printDateTime } from '@/services/CommonService'

const props = defineProps({
  clientId: { type: Number, required: true }
})

const history = ref([])
const loading = ref(false)

async function load() {
  if (!props.clientId) return
  loading.value = true
  try {
    history.value = await ClientService.getCreditHistory(props.clientId)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.clientId, load)

const changeTypeLabel = {
  STATUS_CHANGE:   'Manual Status Change',
  LIMIT_CHANGE:    'Limit Change',
  AUTO_ESCALATION: 'Auto Escalation',
}

function dotColor(h) {
  const s = h.newStatus
  if (s === 'BLOCKED' || s === 'BLACKLISTED') return 'error'
  if (s === 'ON_HOLD') return 'warning'
  return 'success'
}
</script>
<template>
  <VCard>
    <VCardText>
      <div v-if="loading" class="text-center py-6">
        <v-progress-circular indeterminate :size="32" />
      </div>
      <div v-else-if="history.length === 0" class="text-center py-6 text-disabled">
        {{ $gettext('No credit history recorded yet.') }}
      </div>
      <VTimeline v-else side="end" density="compact" truncate-line="start">
        <VTimelineItem
          v-for="h in history"
          :key="h.id"
          :dot-color="dotColor(h)"
          size="small"
        >
          <template #opposite>
            <span class="text-xs text-disabled">
              {{ printDateTime(h.createdDate, 'DD/MM/YYYY HH:mm') }}
            </span>
          </template>
          <VCard variant="outlined" class="py-2 px-3">
            <div class="d-flex align-center gap-2 mb-1 flex-wrap">
              <VChip size="x-small" :color="h.changeType === 'AUTO_ESCALATION' ? 'secondary' : 'primary'">
                {{ changeTypeLabel[h.changeType] ?? h.changeType }}
              </VChip>
              <span v-if="h.oldStatus && h.newStatus" class="text-sm">
                <strong>{{ h.oldStatus }}</strong>
                <VIcon size="12" icon="tabler-arrow-right" class="mx-1" />
                <strong>{{ h.newStatus }}</strong>
              </span>
            </div>
            <div v-if="h.oldLimitAmount !== null || h.newLimitAmount !== null" class="text-sm text-disabled">
              Limit: {{ h.oldLimitAmount ?? '—' }} → {{ h.newLimitAmount ?? '—' }} {{ h.currency }}
            </div>
            <div v-if="h.reason" class="text-sm mt-1">{{ h.reason }}</div>
            <div v-if="h.changedBy" class="text-xs text-disabled mt-1">
              By {{ h.changedBy.firstName }} {{ h.changedBy.lastName }}
            </div>
          </VCard>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
