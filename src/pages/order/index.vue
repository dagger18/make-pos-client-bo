<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Orders</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-cash-register" :to="{ name: 'pos' }">
        Open POS
      </VBtn>
    </VCardTitle>

    <VCardText class="pb-0">
      <VRow dense>
        <VCol cols="12" sm="4">
          <VTextField v-model="filters.q" label="Search by ID or notes" clearable density="compact"
            prepend-inner-icon="tabler-search" @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="3">
          <VSelect v-model="filters.status" :items="statusOptions" label="Status"
            density="compact" clearable @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="2">
          <VTextField v-model="filters.date_from" label="From" type="date" density="compact"
            @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="2">
          <VTextField v-model="filters.date_to" label="To" type="date" density="compact"
            @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="1" class="d-flex align-center">
          <VBtn variant="tonal" size="small" @click="clearFilters">Clear</VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="orders"
      :loading="loading"
      item-value="id"
    >
      <template #item.id="{ item }">
        <span class="font-weight-medium">#{{ item.id }}</span>
      </template>

      <template #item.status="{ item }">
        <VChip size="small" :color="statusColor(item.status)" label>{{ item.status }}</VChip>
      </template>

      <template #item.total="{ item }">
        {{ Number(item.total).toFixed(2) }}
      </template>

      <template #item.paidAmount="{ item }">
        {{ Number(item.paidAmount).toFixed(2) }}
      </template>

      <template #item.actions="{ item }">
        <VBtn icon size="small" variant="text" :to="{ name: 'order-id', params: { id: item.id } }">
          <VIcon icon="tabler-eye" />
        </VBtn>
        <VBtn v-if="item.status !== 'paid'" icon size="small" variant="text" color="error"
          @click="cancelOrder(item)">
          <VIcon icon="tabler-x" />
        </VBtn>
      </template>
    </VDataTable>
  </VCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SalesService from '@/services/SalesService'

const orders = ref([])
const loading = ref(false)
const filters = ref({ q: '', status: null, date_from: '', date_to: '' })

const statusOptions = [
  { title: 'Open', value: 'open' },
  { title: 'Paid', value: 'paid' },
  { title: 'Cancelled', value: 'cancelled' },
]

const headers = [
  { title: '#', key: 'id', width: '80px' },
  { title: 'Status', key: 'status' },
  { title: 'Items', key: 'itemCount', sortable: false },
  { title: 'Total', key: 'total' },
  { title: 'Paid', key: 'paidAmount' },
  { title: 'Notes', key: 'notes', sortable: false },
  { title: 'Date', key: 'createdAt' },
  { title: '', key: 'actions', sortable: false },
]

const statusColor = (s) => ({ open: 'warning', paid: 'success', cancelled: 'error' }[s] ?? 'default')

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.q) params.set('q', filters.value.q)
  if (filters.value.status) params.set('status', filters.value.status)
  if (filters.value.date_from) params.set('date_from', filters.value.date_from)
  if (filters.value.date_to) params.set('date_to', filters.value.date_to)
  const res = await SalesService.listOrders(params.toString())
  orders.value = res ?? []
  loading.value = false
}

const clearFilters = () => {
  filters.value = { q: '', status: null, date_from: '', date_to: '' }
  load()
}

const cancelOrder = async (item) => {
  if (!confirm(`Cancel order #${item.id}?`)) return
  await SalesService.cancelOrder(item.id)
  await load()
}

onMounted(load)
</script>
