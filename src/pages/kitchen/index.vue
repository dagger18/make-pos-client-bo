<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Kitchen Display</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="sendDialog = true">
        Send Order to Kitchen
      </VBtn>
    </VCardTitle>

    <VCardText class="pb-0">
      <VRow dense>
        <VCol cols="12" sm="4">
          <VSelect
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            clearable
            density="compact"
            @update:modelValue="load"
          />
        </VCol>
        <VCol cols="12" sm="2" class="d-flex align-center justify-end">
          <VBtn variant="tonal" size="small" @click="clearFilters">Clear</VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      item-value="id"
    >
      <template #item.orderId="{ item }">
        <span class="font-weight-medium">#{{ item.order?.id }}</span>
      </template>

      <template #item.items="{ item }">
        <span class="text-caption">
          {{ (item.order?.items ?? []).map(i => `${i.quantity}× ${i.productName}`).join(', ') || '—' }}
        </span>
      </template>

      <template #item.status="{ item }">
        <VChip :color="statusColor(item.status)" size="small">{{ item.status }}</VChip>
      </template>

      <template #item.actions="{ item }">
        <VBtn
          v-if="item.status !== 'ready'"
          size="small"
          variant="tonal"
          color="primary"
          @click="advanceTicket(item)"
        >
          {{ item.status === 'pending' ? 'Start' : 'Mark Ready' }}
        </VBtn>
        <VChip v-else color="success" size="small" variant="tonal">Done</VChip>
      </template>
    </VDataTable>
  </VCard>

  <!-- ── Send Order Dialog ──────────────────────────────────────── -->
  <VDialog v-model="sendDialog" max-width="360">
    <VCard>
      <VCardTitle>Send Order to Kitchen</VCardTitle>
      <VCardText>
        <VTextField
          v-model.number="sendOrderId"
          label="Order ID"
          type="number"
          min="1"
          density="compact"
          autofocus
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="sendDialog = false">Cancel</VBtn>
        <VBtn color="primary" :disabled="!sendOrderId" @click="submitSend">Send</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import KitchenService from '@/services/KitchenService'

const items   = ref([])
const loading = ref(false)
const filters = ref({ status: null })

const statusOptions = [
  { title: 'Pending',     value: 'pending' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Ready',       value: 'ready' },
]

const headers = [
  { title: 'Order',   key: 'orderId',   sortable: false },
  { title: 'Items',   key: 'items',     sortable: false },
  { title: 'Status',  key: 'status',    sortable: false },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: '',        key: 'actions',   sortable: false },
]

const statusColor = (s) => ({
  pending:     'warning',
  in_progress: 'info',
  ready:       'success',
}[s] ?? 'default')

const sendDialog  = ref(false)
const sendOrderId = ref(null)

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.status) params.set('status', filters.value.status)
  const res = await KitchenService.listTickets(params.toString())
  items.value = res?.list ?? res ?? []
  loading.value = false
}

const clearFilters = () => {
  filters.value = { status: null }
  load()
}

const advanceTicket = async (item) => {
  await KitchenService.advance(item.id)
  await load()
}

const submitSend = async () => {
  await KitchenService.createFromOrder(sendOrderId.value)
  sendDialog.value  = false
  sendOrderId.value = null
  await load()
}

onMounted(load)
</script>
