<script setup>
import TrackingRequestService from '@/services/TrackingRequestService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Provider' } })

const { $gettext } = useGettext()

const rows      = ref([])
const loading   = ref(false)
const statusFilter = ref('')
const typeFilter   = ref('')

const statusOptions = ['', 'ACTIVE', 'PAUSED', 'FAILED', 'COMPLETED']
const typeOptions   = ['', 'CONTAINER', 'MBL', 'FLIGHT']

const statusColor = { ACTIVE: 'success', PAUSED: 'warning', FAILED: 'error', COMPLETED: 'secondary' }

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (typeFilter.value)   params.set('type', typeFilter.value)
    rows.value = (await TrackingRequestService.listAll(params.toString())) ?? []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4" align="center">
      <VCol cols="12" sm="2">
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          :label="$gettext('Status')"
          density="compact"
          hide-details
          clearable
          @update:modelValue="load"
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect
          v-model="typeFilter"
          :items="typeOptions"
          :label="$gettext('Type')"
          density="compact"
          hide-details
          clearable
          @update:modelValue="load"
        />
      </VCol>
      <VCol cols="auto">
        <VBtn
          variant="tonal"
          prepend-icon="tabler-refresh"
          :loading="loading"
          @click="load"
        >
          {{ $gettext('Refresh') }}
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Shipment') }}</th>
            <th>{{ $gettext('Type') }}</th>
            <th>{{ $gettext('Reference') }}</th>
            <th>{{ $gettext('Carrier') }}</th>
            <th>{{ $gettext('Status') }}</th>
            <th>{{ $gettext('Last Event') }}</th>
            <th>{{ $gettext('Last Checked') }}</th>
            <th class="text-right">{{ $gettext('Errors') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center pa-4">
              <VProgressCircular indeterminate size="24" />
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="8" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('No tracking subscriptions found.') }}
            </td>
          </tr>
          <tr
            v-for="r in rows"
            :key="r.id"
            class="cursor-pointer"
            @click="$router.push(`/shipment/${r.shipmentId}`)"
          >
            <td class="font-weight-medium">{{ r.shipmentRef ?? r.shipmentId }}</td>
            <td>{{ r.trackingType }}</td>
            <td class="font-weight-medium">{{ r.trackingRef }}</td>
            <td>{{ r.carrierScac ?? '—' }}</td>
            <td>
              <VChip
                :color="statusColor[r.status]"
                size="small"
                label
              >
                {{ r.status }}
              </VChip>
            </td>
            <td>{{ r.lastEventAt ? new Date(r.lastEventAt).toLocaleString() : '—' }}</td>
            <td>{{ r.lastCheckedAt ? new Date(r.lastCheckedAt).toLocaleString() : '—' }}</td>
            <td class="text-right">
              <VChip v-if="r.errorCount > 0" color="error" size="x-small" label>
                {{ r.errorCount }}
              </VChip>
              <span v-else class="text-medium-emphasis">0</span>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
