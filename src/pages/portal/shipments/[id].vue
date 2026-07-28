<script setup>
import { useGettext } from 'vue3-gettext'
import PortalShipmentService from '@/services/portal/PortalShipmentService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const route = useRoute()
const shipment = ref(null)
const loading = ref(true)

onMounted(async () => {
  shipment.value = await PortalShipmentService.get(route.params.id)
  loading.value = false
})
</script>
<template>
  <div>
    <VBtn variant="text" prepend-icon="tabler-arrow-left" :to="'/portal/shipments'" class="mb-4">
      {{ $gettext('Back') }}
    </VBtn>

    <VProgressLinear v-if="loading" indeterminate class="mb-4" />

    <template v-if="shipment">
      <h1 class="text-h5 mb-2">{{ shipment.code }}</h1>
      <div class="text-body-2 text-medium-emphasis mb-6">
        {{ shipment.transportMode }} · {{ shipment.pol }} → {{ shipment.pod }}
      </div>

      <VRow>
        <VCol cols="6" md="3">
          <div class="text-caption text-medium-emphasis">{{ $gettext('ETD') }}</div>
          <div class="font-weight-medium">{{ shipment.etd ?? '—' }}</div>
        </VCol>
        <VCol cols="6" md="3">
          <div class="text-caption text-medium-emphasis">{{ $gettext('ETA') }}</div>
          <div class="font-weight-medium">{{ shipment.eta ?? '—' }}</div>
        </VCol>
        <VCol cols="6" md="3">
          <div class="text-caption text-medium-emphasis">{{ $gettext('Status') }}</div>
          <VChip size="small" class="mt-1">{{ shipment.status }}</VChip>
        </VCol>
      </VRow>

      <VCard class="mt-6">
        <VCardTitle>{{ $gettext('Milestone Timeline') }}</VCardTitle>
        <VCardText>
          <VTimeline v-if="shipment.milestones?.length" density="compact" side="end">
            <VTimelineItem
              v-for="m in shipment.milestones"
              :key="m.milestoneCode"
              :dot-color="m.actualDate ? 'success' : 'grey-lighten-2'"
              size="small"
            >
              <div class="font-weight-medium">{{ m.label }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ m.actualDate ? new Date(m.actualDate).toLocaleString() : (m.plannedDate ? $gettext('Expected: ') + new Date(m.plannedDate).toLocaleDateString() : $gettext('Pending')) }}
              </div>
            </VTimelineItem>
          </VTimeline>
          <div v-else class="text-medium-emphasis">{{ $gettext('No tracking updates yet') }}</div>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>
