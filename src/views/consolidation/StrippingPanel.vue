<script setup>
// StrippingService removed - freight-specific service
const StrippingService = null;
// WarehouseFacilityService removed - freight-specific service
const WarehouseFacilityService = null;

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
    containerArrival: '',
    status: 'PENDING',
    startedAt: '',
    completedAt: '',
    notes: '',
  }
}

async function load() {
  loading.value = true
  instructions.value = await StrippingService.list(props.consolId) ?? []
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
    containerArrival: ins.containerArrival?.slice(0, 16) ?? '',
    status: ins.status,
    startedAt: ins.startedAt?.slice(0, 16) ?? '',
    completedAt: ins.completedAt?.slice(0, 16) ?? '',
    notes: ins.notes ?? '',
  }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    containerArrival: form.value.containerArrival ? new Date(form.value.containerArrival).toISOString() : null,
    startedAt: form.value.startedAt ? new Date(form.value.startedAt).toISOString() : null,
    completedAt: form.value.completedAt ? new Date(form.value.completedAt).toISOString() : null,
  }
  if (editingId.value) {
    await StrippingService.update(props.consolId, editingId.value, payload)
  } else {
    await StrippingService.create(props.consolId, payload)
  }
  saving.value = false
  dialogOpen.value = false
  await load()
}

async function remove(id) {
  await StrippingService.delete(props.consolId, id)
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
      <VIcon icon="tabler-stack-pop" size="18" class="me-2" />
      {{ $gettext('Stripping Instructions') }}
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
          <th>{{ $gettext('Arrival') }}</th>
          <th>{{ $gettext('Status') }}</th>
          <th>{{ $gettext('Completed') }}</th>
          <th>{{ $gettext('Results') }}</th>
          <th v-if="editable"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="editable ? 8 : 7" class="text-center pa-3"><VProgressCircular indeterminate size="20" /></td>
        </tr>
        <tr v-else-if="!instructions.length">
          <td :colspan="editable ? 8 : 7" class="text-center text-medium-emphasis pa-3">{{ $gettext('No stripping instructions yet.') }}</td>
        </tr>
        <tr v-for="ins in instructions" :key="ins.id">
          <td class="font-weight-medium">{{ ins.instructionNumber }}</td>
          <td>{{ facilityName(ins.facilityId) }}</td>
          <td class="text-caption">{{ ins.containerNumber ?? '—' }}</td>
          <td class="text-caption">{{ formatDate(ins.containerArrival) }}</td>
          <td>
            <VChip :color="statusColor[ins.status] ?? 'default'" size="x-small" label>{{ ins.status }}</VChip>
          </td>
          <td class="text-caption">{{ formatDate(ins.completedAt) }}</td>
          <td>{{ ins.results?.length ?? 0 }}</td>
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
    <VCard :title="editingId ? $gettext('Edit Stripping Instruction') : $gettext('New Stripping Instruction')">
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
            <VTextField v-model="form.instructionNumber" :label="$gettext('Instruction Number')" density="compact" placeholder="STR-2026-001" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.containerNumber" :label="$gettext('Container Number')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.containerArrival" :label="$gettext('Container Arrival')" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="6">
            <VSelect v-model="form.status" :items="STATUSES" :label="$gettext('Status')" density="compact" />
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
