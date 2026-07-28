<script setup>
// ParcelService removed - freight-specific service
const ParcelService = null;

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const parcels = ref([])
const dialogOpen = ref(false)
const editing = ref(null)
const saving = ref(false)

const serviceLevels = [
  { value: 'ECONOMY',  title: 'Economy (3–7 days)' },
  { value: 'EXPRESS',  title: 'Express (1–3 days)' },
  { value: 'OVERNIGHT', title: 'Overnight' },
  { value: 'SAME-DAY', title: 'Same Day' },
]

const integrators = ['FEDEX', 'DHL', 'UPS', 'TNT']

function emptyForm() {
  return {
    serviceLevel: 'EXPRESS',
    grossWeightKg: null,
    pieces: 1,
    trackingNumber: null,
    integrator: null,
    declaredValue: null,
    declaredCurrency: null,
  }
}

function openAdd() {
  editing.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(parcel) {
  editing.value = { ...parcel }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  if (editing.value.id) {
    await ParcelService.update(props.shipment.id, editing.value.id, editing.value)
  } else {
    await ParcelService.create(props.shipment.id, editing.value)
  }
  dialogOpen.value = false
  await load()
  saving.value = false
}

async function remove(parcel) {
  await ParcelService.delete(props.shipment.id, parcel.id)
  await load()
}

async function load() {
  parcels.value = await ParcelService.list(props.shipment.id) ?? []
}

onMounted(load)
</script>

<template>
  <VCard variant="outlined" class="mt-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
      <VIcon icon="tabler-package" size="18" color="primary" class="me-2" />
      {{ $gettext('Parcels') }}
      <VChip v-if="parcels.length" color="primary" size="x-small" class="ms-2">{{ parcels.length }}</VChip>
      <VSpacer />
      <VBtn v-if="editable" size="small" color="primary" variant="outlined" @click="openAdd">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Parcel') }}
      </VBtn>
    </VCardTitle>

    <VCardText class="pt-2">
      <div v-if="parcels.length === 0" class="text-caption text-disabled">
        {{ $gettext('No parcels added.') }}
      </div>
      <VTable v-else density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Service Level') }}</th>
            <th>{{ $gettext('Pieces') }}</th>
            <th>{{ $gettext('Gross Weight (kg)') }}</th>
            <th>{{ $gettext('Integrator') }}</th>
            <th>{{ $gettext('Tracking No.') }}</th>
            <th>{{ $gettext('Declared Value') }}</th>
            <th v-if="editable"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in parcels" :key="p.id">
            <td><VChip color="primary" size="x-small" label>{{ p.serviceLevel }}</VChip></td>
            <td>{{ p.pieces }}</td>
            <td>{{ p.grossWeightKg }}</td>
            <td>{{ p.integrator ?? '—' }}</td>
            <td>{{ p.trackingNumber ?? '—' }}</td>
            <td>{{ p.declaredValue ? `${p.declaredValue} ${p.declaredCurrency ?? ''}` : '—' }}</td>
            <td v-if="editable">
              <VBtn icon size="x-small" variant="plain" @click="openEdit(p)">
                <VIcon icon="tabler-pencil" size="14" />
              </VBtn>
              <VBtn icon size="x-small" variant="plain" color="error" @click="remove(p)">
                <VIcon icon="tabler-trash" size="14" />
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>

  <VDialog v-model="dialogOpen" max-width="600" scrollable>
    <VCard :title="editing?.id ? $gettext('Edit Parcel') : $gettext('Add Parcel')">
      <VCardText v-if="editing">
        <VRow dense>
          <VCol cols="12" sm="6">
            <VSelect v-model="editing.serviceLevel" :items="serviceLevels" item-title="title" item-value="value"
              :label="$gettext('Service Level')" density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="editing.pieces" type="number" :label="$gettext('Pieces')" density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="editing.grossWeightKg" type="number" :label="$gettext('Gross Weight (kg)')"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect v-model="editing.integrator" :items="integrators" :label="$gettext('Integrator')"
              density="compact" clearable />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="editing.trackingNumber" :label="$gettext('Tracking Number')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="editing.declaredValue" type="number" :label="$gettext('Declared Value')"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="editing.declaredCurrency" :label="$gettext('Currency (ISO 4217)')"
              placeholder="USD" density="compact" />
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
