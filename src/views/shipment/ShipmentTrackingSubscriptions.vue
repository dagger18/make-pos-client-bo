<script setup>
import TrackingRequestService from '@/services/TrackingRequestService'

const props = defineProps({ shipment: { type: Object, required: true } })

const requests = ref([])
const loading = ref(false)
const saving = ref(false)
const form = ref({ trackingType: 'CONTAINER', trackingRef: '', carrierScac: '' })
const expandedRow = ref(null)
const events = ref([])
const eventsLoading = ref(false)

const trackingTypes = ['CONTAINER', 'MBL', 'FLIGHT']

async function load() {
  loading.value = true
  requests.value = await TrackingRequestService.list(props.shipment.id) ?? []
  loading.value = false
}

async function add() {
  saving.value = true
  const created = await TrackingRequestService.add(props.shipment.id, { ...form.value })
  if (created) {
    form.value = { trackingType: 'CONTAINER', trackingRef: '', carrierScac: '' }
    await load()
  }
  saving.value = false
}

async function toggleStatus(req) {
  if (req.status === 'ACTIVE') {
    await TrackingRequestService.pause(props.shipment.id, req.id)
  } else {
    await TrackingRequestService.resume(props.shipment.id, req.id)
  }
  await load()
}

async function remove(req) {
  await TrackingRequestService.delete(props.shipment.id, req.id)
  await load()
}

async function showEvents(req) {
  if (expandedRow.value === req.id) {
    expandedRow.value = null
    events.value = []
    return
  }
  expandedRow.value = req.id
  eventsLoading.value = true
  events.value = await TrackingRequestService.events(props.shipment.id, req.id) ?? []
  eventsLoading.value = false
}

onMounted(load)
</script>
<template>
  <VCard :elevation="0" :loading="loading" class="mt-4">
    <VCardText>
      <div class="text-subtitle-1 mb-4">{{ $gettext('Add Tracking Subscription') }}</div>
      <VRow>
        <VCol cols="12" md="3">
          <VSelect v-model="form.trackingType" :items="trackingTypes" :label="$gettext('Type')" density="compact" />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField v-model="form.trackingRef" :label="$gettext('Reference (container/MBL/flight)')" density="compact" />
        </VCol>
        <VCol cols="12" md="2">
          <VTextField v-model="form.carrierScac" :label="$gettext('Carrier SCAC')" density="compact" />
        </VCol>
        <VCol cols="12" md="3" class="d-flex align-center">
          <SubmitBtn :loading="saving" @click="add" :disabled="!form.trackingRef">
            {{ $gettext('Subscribe') }}
          </SubmitBtn>
        </VCol>
      </VRow>

      <VDivider class="my-4" />

      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Type') }}</th>
            <th>{{ $gettext('Reference') }}</th>
            <th>{{ $gettext('Carrier') }}</th>
            <th>{{ $gettext('Status') }}</th>
            <th>{{ $gettext('Last Event') }}</th>
            <th>{{ $gettext('Last Checked') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="req in requests" :key="req.id">
            <tr>
              <td>{{ req.trackingType }}</td>
              <td>{{ req.trackingRef }}</td>
              <td>{{ req.carrierScac ?? '—' }}</td>
              <td>
                <VChip :color="req.status === 'ACTIVE' ? 'success' : req.status === 'FAILED' ? 'error' : 'warning'" size="small">
                  {{ req.status }}
                </VChip>
              </td>
              <td>{{ req.lastEventAt ? new Date(req.lastEventAt).toLocaleString() : '—' }}</td>
              <td>{{ req.lastCheckedAt ? new Date(req.lastCheckedAt).toLocaleString() : '—' }}</td>
              <td>
                <VBtn size="x-small" variant="text" @click="showEvents(req)" :title="$gettext('events')">
                  <VIcon :icon="expandedRow === req.id ? 'tabler-chevron-up' : 'tabler-list-details'" size="18" />
                </VBtn>
                <VBtn size="x-small" variant="text" @click="toggleStatus(req)" :title="req.status === 'ACTIVE' ? $gettext('pause') : $gettext('resume')">
                  <VIcon :icon="req.status === 'ACTIVE' ? 'tabler-player-pause' : 'tabler-player-play'" size="18" />
                </VBtn>
                <VBtn size="x-small" variant="text" color="error" @click="remove(req)" :title="$gettext('delete')">
                  <VIcon icon="tabler-trash" size="18" />
                </VBtn>
              </td>
            </tr>
            <tr v-if="expandedRow === req.id">
              <td colspan="7" class="pa-0">
                <VCard :elevation="0" class="ma-2">
                  <VCardText>
                    <div class="text-caption text-medium-emphasis mb-2">{{ $gettext('Raw Events') }}</div>
                    <VProgressLinear v-if="eventsLoading" indeterminate />
                    <VTable v-else density="compact">
                      <thead>
                        <tr>
                          <th>{{ $gettext('Received') }}</th>
                          <th>{{ $gettext('Source') }}</th>
                          <th>{{ $gettext('Processed') }}</th>
                          <th>{{ $gettext('Error') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="ev in events" :key="ev.id">
                          <td>{{ new Date(ev.receivedAt).toLocaleString() }}</td>
                          <td>{{ ev.source }}</td>
                          <td>
                            <VIcon :icon="ev.isProcessed ? 'tabler-check' : 'tabler-clock'" :color="ev.isProcessed ? 'success' : 'warning'" size="16" />
                          </td>
                          <td class="text-error text-caption">{{ ev.error ?? '' }}</td>
                        </tr>
                        <tr v-if="!events.length">
                          <td colspan="4" class="text-center text-medium-emphasis">{{ $gettext('No events yet') }}</td>
                        </tr>
                      </tbody>
                    </VTable>
                  </VCardText>
                </VCard>
              </td>
            </tr>
          </template>
          <tr v-if="!requests.length">
            <td colspan="7" class="text-center text-medium-emphasis py-4">{{ $gettext('No tracking subscriptions') }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>
