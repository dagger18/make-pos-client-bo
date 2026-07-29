<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Shifts</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-clock-play" @click="openDialog = true">
        Open Shift
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
      <template #item.status="{ item }">
        <VChip :color="item.status === 'open' ? 'success' : 'default'" size="small">
          {{ item.status }}
        </VChip>
      </template>

      <template #item.cashier="{ item }">
        {{ item.cashier?.name ?? '—' }}
      </template>

      <template #item.openingAmount="{ item }">
        {{ Number(item.openingAmount).toFixed(2) }}
      </template>

      <template #item.closingAmount="{ item }">
        {{ item.closingAmount != null ? Number(item.closingAmount).toFixed(2) : '—' }}
      </template>

      <template #item.openedAt="{ item }">
        {{ item.openedAt }}
      </template>

      <template #item.closedAt="{ item }">
        {{ item.closedAt ?? '—' }}
      </template>

      <template #item.actions="{ item }">
        <VBtn
          v-if="item.status === 'open'"
          size="small"
          variant="tonal"
          color="warning"
          @click="startClose(item)"
        >
          Close
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- ── Open Shift Dialog ──────────────────────────────────────── -->
  <VDialog v-model="openDialog" max-width="420">
    <VCard>
      <VCardTitle>Open Shift</VCardTitle>
      <VCardText>
        <VTextField
          v-model="openForm.opening_amount"
          label="Opening Float (cash in till)"
          type="number"
          min="0"
          step="0.01"
          density="compact"
          class="mb-3"
        />
        <VTextField
          v-model="openForm.notes"
          label="Notes (optional)"
          density="compact"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="openDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="submitOpen">Open</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Close Shift Dialog ─────────────────────────────────────── -->
  <VDialog v-model="closeDialog" max-width="420">
    <VCard>
      <VCardTitle>Close Shift</VCardTitle>
      <VCardText>
        <div class="mb-3 text-body-2 text-medium-emphasis">
          Opened: {{ closeTarget?.openedAt }} — Float: {{ closeTarget ? Number(closeTarget.openingAmount).toFixed(2) : '' }}
        </div>
        <VTextField
          v-model="closeForm.closing_amount"
          label="Closing Float (cash counted)"
          type="number"
          min="0"
          step="0.01"
          density="compact"
          class="mb-3"
        />
        <VTextField
          v-model="closeForm.notes"
          label="Notes (optional)"
          density="compact"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="closeDialog = false">Cancel</VBtn>
        <VBtn color="warning" @click="submitClose">Close Shift</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ShiftService from '@/services/ShiftService'

const items   = ref([])
const loading = ref(false)
const filters = ref({ status: null })

const statusOptions = [
  { title: 'Open',   value: 'open' },
  { title: 'Closed', value: 'closed' },
]

const headers = [
  { title: 'Cashier',        key: 'cashier',        sortable: false },
  { title: 'Status',         key: 'status',         sortable: false },
  { title: 'Opened At',      key: 'openedAt',       sortable: true },
  { title: 'Closed At',      key: 'closedAt',       sortable: false },
  { title: 'Opening Float',  key: 'openingAmount',  sortable: false },
  { title: 'Closing Float',  key: 'closingAmount',  sortable: false },
  { title: '',               key: 'actions',        sortable: false },
]

// Open shift dialog
const openDialog = ref(false)
const openForm   = ref({ opening_amount: '0', notes: '' })

// Close shift dialog
const closeDialog  = ref(false)
const closeTarget  = ref(null)
const closeForm    = ref({ closing_amount: '0', notes: '' })

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.status) params.set('status', filters.value.status)
  const res = await ShiftService.listShifts(params.toString())
  items.value = res?.list ?? res ?? []
  loading.value = false
}

const clearFilters = () => {
  filters.value = { status: null }
  load()
}

const submitOpen = async () => {
  await ShiftService.openShift(openForm.value)
  openDialog.value = false
  openForm.value   = { opening_amount: '0', notes: '' }
  await load()
}

const startClose = (item) => {
  closeTarget.value = item
  closeForm.value   = { closing_amount: item.openingAmount ?? '0', notes: '' }
  closeDialog.value = true
}

const submitClose = async () => {
  await ShiftService.closeShift(closeTarget.value.id, closeForm.value)
  closeDialog.value = false
  await load()
}

onMounted(load)
</script>
