<script setup>
import { useGettext } from 'vue3-gettext'
import IntegrationService from '@/services/IntegrationService'

definePage({ meta: { action: 'GET', subject: 'Integration' } })

const { $gettext } = useGettext()

const messages   = ref([])
const loading    = ref(false)
const detailMsg  = ref(null)
const detailDialog = ref(false)

const filterDirection   = ref('')
const filterMessageType = ref('')
const filterStatus      = ref('')
const filterPartnerType = ref('')
const filterFrom        = ref('')
const filterTo          = ref('')

const DIRECTIONS    = ['', 'INBOUND', 'OUTBOUND']
const MESSAGE_TYPES = ['', 'BOOKING', 'SI', 'CUSTOMS_DECL', 'TRACKING', 'RATE_CARD', 'STATUS']
const STATUSES      = ['', 'PENDING', 'SENT', 'RECEIVED', 'ACK', 'REJECTED', 'FAILED']
const PARTNER_TYPES = ['', 'CARRIER', 'CUSTOMS', 'PORT', 'AGENT', 'AGGREGATOR']

const STATUS_COLOR = {
  PENDING: 'default', SENT: 'info', RECEIVED: 'primary',
  ACK: 'success', REJECTED: 'error', FAILED: 'error',
}
const DIR_COLOR = { INBOUND: 'info', OUTBOUND: 'warning' }

async function run() {
  loading.value = true
  try {
    messages.value = await IntegrationService.listMessages({
      direction:    filterDirection.value || undefined,
      message_type: filterMessageType.value || undefined,
      status:       filterStatus.value || undefined,
      partner_type: filterPartnerType.value || undefined,
      from:         filterFrom.value || undefined,
      to:           filterTo.value || undefined,
    }) ?? []
  } finally {
    loading.value = false
  }
}

async function openDetail(msg) {
  try {
    const full = await IntegrationService.getMessage(msg.id)
    if (full) {
      detailMsg.value = full
      detailDialog.value = true
    }
  } catch {
    // silently ignore — table row click should not throw visible errors
  }
}
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4 px-2" align="center" dense>
      <VCol cols="12" sm="2">
        <VSelect v-model="filterDirection" :items="DIRECTIONS" :label="$gettext('Direction')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect v-model="filterMessageType" :items="MESSAGE_TYPES" :label="$gettext('Message Type')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect v-model="filterStatus" :items="STATUSES" :label="$gettext('Status')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="2">
        <VSelect v-model="filterPartnerType" :items="PARTNER_TYPES" :label="$gettext('Partner Type')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterFrom" type="date" :label="$gettext('From')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField v-model="filterTo" type="date" :label="$gettext('To')" density="compact" hide-details />
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" :loading="loading" @click="run">{{ $gettext('Search') }}</VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('ID') }}</th>
            <th>{{ $gettext('Direction') }}</th>
            <th>{{ $gettext('Type') }}</th>
            <th>{{ $gettext('Protocol') }}</th>
            <th>{{ $gettext('Partner') }}</th>
            <th>{{ $gettext('Shipment') }}</th>
            <th>{{ $gettext('Ref') }}</th>
            <th>{{ $gettext('Status') }}</th>
            <th>{{ $gettext('Retries') }}</th>
            <th>{{ $gettext('Sent At') }}</th>
            <th>{{ $gettext('Created') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="12" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
          </tr>
          <tr v-else-if="!messages.length">
            <td colspan="12" class="text-center text-disabled pa-4 text-caption">
              {{ $gettext('No messages found. Apply filters and click Search.') }}
            </td>
          </tr>
          <tr v-for="m in messages" :key="m.id" style="cursor:pointer" @click="openDetail(m)">
            <td class="text-caption text-disabled">{{ m.id }}</td>
            <td>
              <VChip size="x-small" :color="DIR_COLOR[m.direction] ?? 'default'">{{ m.direction }}</VChip>
            </td>
            <td class="text-caption font-weight-medium">{{ m.messageType }}</td>
            <td class="text-caption">{{ m.protocol }}</td>
            <td class="text-caption">
              <VChip size="x-small" color="default" class="me-1">{{ m.partnerType }}</VChip>
              {{ m.partnerName || '' }}
            </td>
            <td class="text-caption">{{ m.shipmentId ?? '—' }}</td>
            <td class="text-caption">{{ m.messageRef || '—' }}</td>
            <td>
              <VChip size="x-small" :color="STATUS_COLOR[m.status] ?? 'default'">{{ m.status }}</VChip>
            </td>
            <td class="text-caption text-center">{{ m.retryCount }}</td>
            <td class="text-caption">{{ m.sentAt ? m.sentAt.slice(0, 16).replace('T', ' ') : '—' }}</td>
            <td class="text-caption">{{ m.createdAt ? m.createdAt.slice(0, 16).replace('T', ' ') : '—' }}</td>
            <td>
              <VIcon size="16" color="info">tabler-eye</VIcon>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>

    <p class="text-caption text-disabled mt-2 px-2">
      {{ $gettext('Click any row to view the raw message payload. Returns up to 50 most recent messages per query.') }}
    </p>

    <!-- Detail Dialog -->
    <VDialog v-model="detailDialog" max-width="820px" scrollable>
      <VCard v-if="detailMsg" :title="`Message #${detailMsg.id} — ${detailMsg.messageType}`">
        <DialogCloseBtn @click="detailDialog = false" />
        <VCardText>
          <VTable density="compact" class="mb-4">
            <tbody>
              <tr><td class="text-caption text-disabled w-33">{{ $gettext('Direction') }}</td><td><VChip size="x-small" :color="DIR_COLOR[detailMsg.direction]">{{ detailMsg.direction }}</VChip></td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Protocol') }}</td><td class="text-caption">{{ detailMsg.protocol }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Partner') }}</td><td class="text-caption">{{ detailMsg.partnerType }} · {{ detailMsg.partnerName || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Status') }}</td><td><VChip size="x-small" :color="STATUS_COLOR[detailMsg.status]">{{ detailMsg.status }}</VChip></td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Reference') }}</td><td class="text-caption">{{ detailMsg.messageRef || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Shipment') }}</td><td class="text-caption">{{ detailMsg.shipmentId || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Sent At') }}</td><td class="text-caption">{{ detailMsg.sentAt || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Received At') }}</td><td class="text-caption">{{ detailMsg.receivedAt || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('ACK At') }}</td><td class="text-caption">{{ detailMsg.ackAt || '—' }}</td></tr>
              <tr><td class="text-caption text-disabled">{{ $gettext('Retry Count') }}</td><td class="text-caption">{{ detailMsg.retryCount }}</td></tr>
              <tr v-if="detailMsg.errorCode">
                <td class="text-caption text-disabled">{{ $gettext('Error') }}</td>
                <td class="text-caption text-error">{{ detailMsg.errorCode }}: {{ detailMsg.errorMessage }}</td>
              </tr>
            </tbody>
          </VTable>

          <div class="text-caption text-disabled mb-1">{{ $gettext('Raw Payload') }}</div>
          <pre class="text-caption bg-surface pa-3 rounded overflow-auto" style="max-height:400px;white-space:pre-wrap;word-break:break-all">{{ detailMsg.payload }}</pre>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>
