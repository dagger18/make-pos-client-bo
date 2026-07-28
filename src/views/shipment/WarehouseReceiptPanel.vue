<script setup>
// WarehouseFacilityService removed - freight-specific service
const WarehouseFacilityService = null;
// WarehouseReceiptService removed - freight-specific service
const WarehouseReceiptService = null;

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const receipts = ref([])
const facilities = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)

const RECEIPT_TYPES = ['INBOUND', 'RETURN_EMPTY', 'TRANSFER_IN']
const CONDITIONS = ['GOOD', 'DAMAGED', 'SHORT', 'EXCESS', 'WET', 'CONTAMINATED']

const conditionColor = {
  GOOD: 'success', DAMAGED: 'error', SHORT: 'warning',
  EXCESS: 'info', WET: 'warning', CONTAMINATED: 'error',
}

const form = ref(emptyForm())

const headers = [
  { title: 'Receipt #',   key: 'receiptNumber' },
  { title: 'Facility',    key: 'facilityId', width: 160 },
  { title: 'Type',        key: 'receiptType', width: 120 },
  { title: 'Pcs',         key: 'piecesReceived', width: 70, align: 'end' },
  { title: 'Wt (kg)',     key: 'grossWeightKg', width: 100, align: 'end' },
  { title: 'Condition',   key: 'conditionCode', width: 110 },
  { title: 'Location',    key: 'storageLocation', width: 110 },
  { title: 'Received',    key: 'receivedAt', width: 140 },
  { title: 'Released',    key: 'releasedAt', width: 100 },
  { title: '',            key: 'actions', width: 80, sortable: false },
]

function emptyForm() {
  return {
    facilityId: null,
    consolId: null,
    receiptNumber: '',
    receiptType: 'INBOUND',
    vehiclePlate: '',
    driverName: '',
    driverIdRef: '',
    piecesReceived: 1,
    piecesExpected: null,
    grossWeightKg: '',
    volumeCbm: '',
    conditionCode: 'GOOD',
    damageNotes: '',
    temperatureC: '',
    storageZone: '',
    storageLocation: '',
    receivedAt: new Date().toISOString().slice(0, 16),
  }
}

async function load() {
  loading.value = true
  receipts.value = await WarehouseReceiptService.list(props.shipment.id) ?? []
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

function openEdit(receipt) {
  editingId.value = receipt.id
  form.value = {
    facilityId: receipt.facilityId,
    consolId: receipt.consolId,
    receiptNumber: receipt.receiptNumber,
    receiptType: receipt.receiptType,
    vehiclePlate: receipt.vehiclePlate ?? '',
    driverName: receipt.driverName ?? '',
    driverIdRef: receipt.driverIdRef ?? '',
    piecesReceived: receipt.piecesReceived,
    piecesExpected: receipt.piecesExpected,
    grossWeightKg: receipt.grossWeightKg,
    volumeCbm: receipt.volumeCbm ?? '',
    conditionCode: receipt.conditionCode,
    damageNotes: receipt.damageNotes ?? '',
    temperatureC: receipt.temperatureC ?? '',
    storageZone: receipt.storageZone ?? '',
    storageLocation: receipt.storageLocation ?? '',
    receivedAt: receipt.receivedAt?.slice(0, 16) ?? '',
  }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    piecesReceived: Number(form.value.piecesReceived),
    piecesExpected: form.value.piecesExpected !== null && form.value.piecesExpected !== '' ? Number(form.value.piecesExpected) : null,
    grossWeightKg: form.value.grossWeightKg || '0',
    volumeCbm: form.value.volumeCbm !== '' ? form.value.volumeCbm : null,
    temperatureC: form.value.temperatureC !== '' ? form.value.temperatureC : null,
    receivedAt: form.value.receivedAt ? new Date(form.value.receivedAt).toISOString() : new Date().toISOString(),
  }
  if (editingId.value) {
    await WarehouseReceiptService.update(props.shipment.id, editingId.value, payload)
  } else {
    await WarehouseReceiptService.create(props.shipment.id, payload)
  }
  saving.value = false
  dialogOpen.value = false
  await load()
}

async function remove(receiptId) {
  await WarehouseReceiptService.delete(props.shipment.id, receiptId)
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
      <VIcon icon="tabler-building-warehouse" size="18" class="me-2" />
      {{ $gettext('Warehouse Receipts') }}
      <VSpacer />
      <VBtn v-if="editable" size="small" color="primary" variant="tonal" @click="openCreate">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Receipt') }}
      </VBtn>
    </VCardTitle>

    <VTable density="compact">
      <thead>
        <tr>
          <th>{{ $gettext('Receipt #') }}</th>
          <th>{{ $gettext('Facility') }}</th>
          <th>{{ $gettext('Type') }}</th>
          <th class="text-end">{{ $gettext('Pcs') }}</th>
          <th class="text-end">{{ $gettext('Wt (kg)') }}</th>
          <th>{{ $gettext('Condition') }}</th>
          <th>{{ $gettext('Location') }}</th>
          <th>{{ $gettext('Received') }}</th>
          <th>{{ $gettext('Released') }}</th>
          <th v-if="editable"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="editable ? 10 : 9" class="text-center pa-3"><VProgressCircular indeterminate size="20" /></td>
        </tr>
        <tr v-else-if="!receipts.length">
          <td :colspan="editable ? 10 : 9" class="text-center text-medium-emphasis pa-3">{{ $gettext('No receipts yet.') }}</td>
        </tr>
        <tr v-for="r in receipts" :key="r.id">
          <td class="font-weight-medium">{{ r.receiptNumber }}</td>
          <td>{{ facilityName(r.facilityId) }}</td>
          <td><VChip size="x-small" label>{{ r.receiptType }}</VChip></td>
          <td class="text-end">{{ r.piecesReceived }}</td>
          <td class="text-end">{{ r.grossWeightKg }}</td>
          <td>
            <VChip :color="conditionColor[r.conditionCode] ?? 'default'" size="x-small" label>
              {{ r.conditionCode }}
            </VChip>
          </td>
          <td class="text-caption">{{ r.storageZone ? `${r.storageZone} · ${r.storageLocation}` : r.storageLocation ?? '—' }}</td>
          <td class="text-caption">{{ formatDate(r.receivedAt) }}</td>
          <td class="text-caption">{{ r.releasedAt ? formatDate(r.releasedAt) : '—' }}</td>
          <td v-if="editable">
            <VBtn icon variant="text" size="x-small" @click="openEdit(r)">
              <VIcon icon="tabler-pencil" size="14" />
            </VBtn>
            <VBtn icon variant="text" size="x-small" color="error" @click="remove(r.id)">
              <VIcon icon="tabler-trash" size="14" />
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <VDialog v-model="dialogOpen" max-width="680">
    <VCard :title="editingId ? $gettext('Edit Receipt') : $gettext('New Warehouse Receipt')">
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
            <VTextField v-model="form.receiptNumber" :label="$gettext('Receipt Number')" density="compact" placeholder="WR-HCM-2026-001" />
          </VCol>
          <VCol cols="6">
            <VSelect v-model="form.receiptType" :items="RECEIPT_TYPES" :label="$gettext('Receipt Type')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.receivedAt" :label="$gettext('Received At')" type="datetime-local" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.piecesReceived" :label="$gettext('Pieces Received')" type="number" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.piecesExpected" :label="$gettext('Pieces Expected')" type="number" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.grossWeightKg" :label="$gettext('Gross Wt (kg)')" type="number" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.volumeCbm" :label="$gettext('Volume (CBM)')" type="number" density="compact" />
          </VCol>
          <VCol cols="4">
            <VSelect v-model="form.conditionCode" :items="CONDITIONS" :label="$gettext('Condition')" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.temperatureC" :label="$gettext('Temp (°C)')" type="number" density="compact" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.storageZone" :label="$gettext('Storage Zone')" density="compact" placeholder="A / REEFER / HAZMAT" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.storageLocation" :label="$gettext('Storage Location')" density="compact" placeholder="A-03-02" />
          </VCol>
          <VCol cols="4">
            <VTextField v-model="form.vehiclePlate" :label="$gettext('Vehicle Plate')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.driverName" :label="$gettext('Driver Name')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.driverIdRef" :label="$gettext('Driver ID Ref')" density="compact" />
          </VCol>
          <VCol v-if="form.conditionCode !== 'GOOD'" cols="12">
            <VTextarea v-model="form.damageNotes" :label="$gettext('Damage Notes')" rows="2" density="compact" />
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
