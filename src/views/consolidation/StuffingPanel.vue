<script setup>
import StuffingService from '@/services/StuffingService'
import WarehouseFacilityService from '@/services/WarehouseFacilityService'

const props = defineProps({
  consolId: { type: Number, required: true },
  editable: { type: Boolean, default: false },
})

const instructions = ref([])
const facilities = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)

const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

const statusColor = { PENDING: 'default', IN_PROGRESS: 'info', COMPLETED: 'success' }

const form = ref(emptyForm())

function emptyForm() {
  return {
    facilityId: null,
    instructionNumber: '',
    containerNumber: '',
    status: 'PENDING',
    scheduledAt: '',
    startedAt: '',
    completedAt: '',
    forkliftOperator: '',
    notes: '',
  }
}

async function load() {
  loading.value = true
  instructions.value = await StuffingService.list(props.consolId) ?? []
  loading.value = false
}

function facilityName(id) {
  return facilities.value.find(f => f.id === id)?.name ?? `#${id}`
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(ins) {
  editingId.value = ins.id
  form.value = {
    facilityId: ins.facilityId,
    instructionNumber: ins.instructionNumber,
    containerNumber: ins.containerNumber ?? '',
    status: ins.status,
    scheduledAt: ins.scheduledAt?.slice(0, 16) ?? '',
    startedAt: ins.startedAt?.slice(0, 16) ?? '',
    completedAt: ins.completedAt?.slice(0, 16) ?? '',
    forkliftOperator: ins.forkliftOperator ?? '',
    notes: ins.notes ?? '',
  }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    scheduledAt: form.value.scheduledAt ? new Date(form.value.scheduledAt).toISOString() : null,
    startedAt: form.value.startedAt ? new Date(form.value.startedAt).toISOString() : null,
    completedAt: form.value.completedAt ? new Date(form.value.completedAt).toISOString() : null,
  }
  if (editingId.value) {
    await StuffingService.update(props.consolId, editingId.value, payload)
  } else {
    await StuffingService.create(props.consolId, payload)
  }
  saving.value = false
  dialogOpen.value = false
  await load()
}

async function remove(id) {
  await StuffingService.delete(props.consolId, id)
  await load()
}

function formatDate(val) {
  if (!val) return '—'
  return val.slice(0, 16).replace('T', ' ')
}

onMounted(async () => {
  const res = await WarehouseFacilityService.list()
  facilities.value = res ?? []
  await load()
})
</script>

<template>
  <VCard variant="outlined" class="mb-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-2 text-body-1 font-weight-medium">
      <VIcon icon="tabler-stack-push" size="18" class="me-2" />
      {{ $gettext('Stuffing Instructions') }}
      <VSpacer />
      <VBtn v-if="editable" size="small" color="primary" variant="tonal" @click="openCreate">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add') }}
      </VBtn>
    </VCardTitle>

    <VTable density="compact">
      <thead>
        <tr>
          <th>{{ $gettext('Instruction #') }}</th>
          <th>{{ $gettext('Facility') }}</th>
          <th>{{ $gettext('Container') }}</th>
          <th>{{ $gettext('Status') }}</th>
          <th>{{ $gettext('Scheduled') }}</th>
          <th>{{ $gettext('Completed') }}</th>
          <th>{{ $gettext('Lines') }}</th>
          <th v-if="editable"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="editable ? 8 : 7" class="text-center pa-3"><VProgressCircular indeterminate size="20" /></td>
        </tr>
        <tr v-else-if="!instructions.length">
          <td :colspan="editable ? 8 : 7" class="text-center text-medium-emphasis pa-3">{{ $gettext('No stuffing instructions yet.') }}</td>
        </tr>
        <tr v-for="ins in instructions" :key="ins.id">
          <td class="font-weight-medium">{{ ins.instructionNumber }}</td>
          <td>{{ facilityName(ins.facilityId) }}</td>
          <td class="text-caption">{{ ins.containerNumber ?? '—' }}</td>
          <td>
            <VChip :color="statusColor[ins.status] ?? 'default'" size="x-small" label>{{ ins.status }}</VChip>
          </td>
          <td class="text-caption">{{ formatDate(ins.scheduledAt) }}</td>
          <td class="text-caption">{{ formatDate(ins.completedAt) }}</td>
          <td>{{ ins.lines?.length ?? 0 }}</td>
          <td v-if="editable">
            <VBtn icon variant="text" size="x-small" @click="openEdit(ins)">
              <VIcon icon="tabler-pencil" size="14" />
            </VBtn>
            <VBtn icon variant="text" size="x-small" color="error" @click="remove(ins.id)">
              <VIcon icon="tabler-trash" size="14" />
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <VDialog v-model="dialogOpen" max-width="600">
    <VCard :title="editingId ? $gettext('Edit Stuffing Instruction') : $gettext('New Stuffing Instruction')">
      <VCardText>
        <VRow dense>
          <VCol cols="6">
            <VSelect
              v-model="form.facilityId"
              :items="facilities"
              item-title="name"
              item-value="id"
              :label="$gettext('Facility')"
              density="compact"
            />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.instructionNumber" :label="$gettext('Instruction Number')" density="compact" placeholder="STF-2026-001" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.containerNumber" :label="$gettext('Container Number')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VSelect v-model="form.status" :items="STATUSES" :label="$gettext('Status')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.scheduledAt" :label="$gettext('Scheduled At')" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.forkliftOperator" :label="$gettext('Forklift Operator')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.startedAt" :label="$gettext('Started At')" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.completedAt" :label="$gettext('Completed At')" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.notes" :label="$gettext('Notes')" rows="2" density="compact" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
