<script setup>
import { filterConfigs, headers } from '@/config/tables/EmissionFactor'
import EmissionsService from '@/services/EmissionsService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-cargo-claim' } })
const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table      = ref(null)
const filterMode = ref(null)
const saving     = ref(false)
const dialog     = ref(false)
const editId     = ref(null)

const MODES         = ['OCN', 'AIR', 'RD', 'RAL']
const METHODOLOGIES = ['GLEC_V3', 'GHG_PROTOCOL', 'IMO_DCS']
const MODE_COLOR    = { OCN: 'info', AIR: 'primary', RD: 'warning', RAL: 'success' }

const emptyForm = () => ({
  transportMode: 'OCN', vehicleType: '', fuelType: '', sizeClass: '',
  loadFactor: null, efTtw: null, efWtw: null,
  methodology: 'GLEC_V3', effectiveFrom: '2024-01-01', effectiveTo: '',
  source: 'GLEC Framework v3 Table 4.2',
})
const form = ref(emptyForm())

const emissionsService = computed(() => ({
  list: (params) => {
    const p = Object.fromEntries(new URLSearchParams(params || ''))
    if (filterMode.value) p.mode = filterMode.value
    return EmissionsService.listFactors(p)
  },
}))

watch(filterMode, () => table.value?.fetchData())

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('New Factor'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  editId.value = item.id
  form.value = {
    transportMode: item.transportMode, vehicleType: item.vehicleType ?? '',
    fuelType: item.fuelType ?? '', sizeClass: item.sizeClass ?? '',
    loadFactor: item.loadFactor ?? null,
    efTtw: item.efTtw, efWtw: item.efWtw,
    methodology: item.methodology,
    effectiveFrom: item.effectiveFrom, effectiveTo: item.effectiveTo ?? '',
    source: item.source,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      effectiveTo: form.value.effectiveTo || null,
      vehicleType: form.value.vehicleType || null,
      fuelType:    form.value.fuelType || null,
      sizeClass:   form.value.sizeClass || null,
    }
    if (editId.value) {
      await EmissionsService.updateFactor(editId.value, payload)
    } else {
      await EmissionsService.createFactor(payload)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this emission factor?')) return
  await EmissionsService.deleteFactor(id)
  await table.value?.fetchData()
}

const fmtEf = (v) => v != null ? Number(v).toFixed(6) : '—'
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="emissionsService"
    :hideTitle="true"
  >
    <template #tableAction>
      <VSelect
        v-model="filterMode"
        :items="[{ title: $gettext('All Modes'), value: null }, ...MODES.map(m => ({ title: m, value: m }))]"
        :label="$gettext('Mode')"
        density="compact"
        hide-details
        clearable
        style="max-width: 160px"
      />
    </template>

    <template #transportMode="{ item }">
      <VChip size="x-small" :color="MODE_COLOR[item.transportMode] ?? 'default'">{{ item.transportMode }}</VChip>
    </template>

    <template #efTtw="{ item }">{{ fmtEf(item.efTtw) }}</template>
    <template #efWtw="{ item }">{{ fmtEf(item.efWtw) }}</template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openEdit(item)"><VIcon>tabler-pencil</VIcon></VBtn>
      <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)"><VIcon>tabler-trash</VIcon></VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="700px" persistent>
    <VCard :title="editId ? $gettext('Edit Emission Factor') : $gettext('New Emission Factor')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="3">
            <VSelect v-model="form.transportMode" :items="MODES" :label="$gettext('Mode')" density="compact" />
          </VCol>
          <VCol cols="12" md="5">
            <VTextField v-model="form.vehicleType" :label="$gettext('Vehicle Type')" density="compact" clearable
              placeholder="e.g. CONTAINER_SHIP" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.sizeClass" :label="$gettext('Size / Class')" density="compact" clearable
              placeholder="e.g. >8000TEU" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.fuelType" :label="$gettext('Fuel Type')" density="compact" clearable
              placeholder="e.g. HFO, MDO, DIESEL" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="form.loadFactor" type="number" step="0.01" min="0" max="1"
              :label="$gettext('Load Factor (0–1)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.methodology" :items="METHODOLOGIES" :label="$gettext('Methodology')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="form.efTtw" type="number" step="0.000001"
              :label="$gettext('EF TTW (kg CO₂e / tonne-km)')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="form.efWtw" type="number" step="0.000001"
              :label="$gettext('EF WTW (kg CO₂e / tonne-km)')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.effectiveFrom" type="date" :label="$gettext('Effective From')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.effectiveTo" type="date" :label="$gettext('Effective To (blank = current)')" density="compact" clearable />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.source" :label="$gettext('Source Reference')" density="compact" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
