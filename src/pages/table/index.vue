<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Tables</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
        Add Table
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
        <VChip :color="statusColor(item.status)" size="small">{{ item.status }}</VChip>
      </template>

      <template #item.capacity="{ item }">
        {{ item.capacity ?? '—' }}
      </template>

      <template #item.actions="{ item }">
        <VBtn size="small" variant="tonal" color="secondary" class="mr-1" @click="openStatus(item)">
          Status
        </VBtn>
        <VBtn size="small" variant="text" icon @click="openEdit(item)">
          <VIcon icon="tabler-edit" />
        </VBtn>
        <VBtn size="small" variant="text" icon color="error" @click="remove(item)">
          <VIcon icon="tabler-trash" />
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- ── Create / Edit Dialog ───────────────────────────────────── -->
  <VDialog v-model="formDialog" max-width="420">
    <VCard>
      <VCardTitle>{{ editTarget ? 'Edit Table' : 'Add Table' }}</VCardTitle>
      <VCardText>
        <VTextField v-model="form.name" label="Table Name / Number" density="compact" class="mb-3" />
        <VTextField v-model.number="form.capacity" label="Capacity (optional)" type="number" min="1"
          density="compact" class="mb-3" />
        <VTextField v-model="form.notes" label="Notes (optional)" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="formDialog = false">Cancel</VBtn>
        <VBtn color="primary" :disabled="!form.name" @click="submitForm">
          {{ editTarget ? 'Save' : 'Add' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Set Status Dialog ──────────────────────────────────────── -->
  <VDialog v-model="statusDialog" max-width="400">
    <VCard>
      <VCardTitle>Set Status — {{ statusTarget?.name }}</VCardTitle>
      <VCardText>
        <VBtnToggle v-model="statusForm.status" mandatory class="mb-4 flex-wrap" density="compact">
          <VBtn value="available">Available</VBtn>
          <VBtn value="occupied">Occupied</VBtn>
          <VBtn value="reserved">Reserved</VBtn>
          <VBtn value="cleaning">Cleaning</VBtn>
        </VBtnToggle>
        <VTextField v-model="statusForm.notes" label="Notes (optional)" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="statusDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="submitStatus">Confirm</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TableService from '@/services/TableService'

const items   = ref([])
const loading = ref(false)
const filters = ref({ status: null })

const statusOptions = [
  { title: 'Available', value: 'available' },
  { title: 'Occupied',  value: 'occupied' },
  { title: 'Reserved',  value: 'reserved' },
  { title: 'Cleaning',  value: 'cleaning' },
]

const headers = [
  { title: 'Name',     key: 'name',     sortable: true },
  { title: 'Capacity', key: 'capacity', sortable: true },
  { title: 'Status',   key: 'status',   sortable: false },
  { title: 'Notes',    key: 'notes',    sortable: false },
  { title: '',         key: 'actions',  sortable: false },
]

const statusColor = (s) => ({
  available: 'success',
  occupied:  'error',
  reserved:  'warning',
  cleaning:  'info',
}[s] ?? 'default')

// Form dialog (create/edit)
const formDialog = ref(false)
const editTarget = ref(null)
const form       = ref({ name: '', capacity: null, notes: '' })

// Status dialog
const statusDialog = ref(false)
const statusTarget = ref(null)
const statusForm   = ref({ status: 'available', notes: '' })

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.status) params.set('status', filters.value.status)
  const res = await TableService.listTables(params.toString())
  items.value = res?.list ?? res ?? []
  loading.value = false
}

const clearFilters = () => {
  filters.value = { status: null }
  load()
}

const openCreate = () => {
  editTarget.value = null
  form.value       = { name: '', capacity: null, notes: '' }
  formDialog.value = true
}

const openEdit = (item) => {
  editTarget.value = item
  form.value       = { id: item.id, name: item.name, capacity: item.capacity, notes: item.notes ?? '' }
  formDialog.value = true
}

const submitForm = async () => {
  if (editTarget.value) {
    await TableService.updateTable(form.value)
  } else {
    await TableService.createTable(form.value)
  }
  formDialog.value = false
  await load()
}

const openStatus = (item) => {
  statusTarget.value = item
  statusForm.value   = { status: item.status, notes: item.notes ?? '' }
  statusDialog.value = true
}

const submitStatus = async () => {
  await TableService.setStatus(statusTarget.value.id, statusForm.value)
  statusDialog.value = false
  await load()
}

const remove = async (item) => {
  if (!confirm(`Delete table "${item.name}"?`)) return
  await TableService.deleteTable(item.id)
  await load()
}

onMounted(load)
</script>
