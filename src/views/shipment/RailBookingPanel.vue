<script setup>
import RailBookingService from '@/services/RailBookingService'

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const booking = ref(null)
const editing = ref(false)
const saving = ref(false)
const form = ref(null)

function emptyForm() {
  return {
    trainService: null,
    departureIcd: null,
    arrivalIcd: null,
    operator: null,
    cimWaybillNumber: null,
    cimWaybillDate: null,
    departureDate: null,
    arrivalDate: null,
    containerCount: null,
    note: null,
  }
}

function startEdit() {
  form.value = booking.value ? { ...booking.value } : emptyForm()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  form.value = null
}

async function save() {
  saving.value = true
  if (booking.value?.id) {
    await RailBookingService.update(props.shipment.id, booking.value.id, form.value)
  } else {
    await RailBookingService.create(props.shipment.id, form.value)
  }
  await load()
  editing.value = false
  saving.value = false
}

async function remove() {
  if (!booking.value) return
  await RailBookingService.delete(props.shipment.id, booking.value.id)
  booking.value = null
}

async function load() {
  const list = await RailBookingService.list(props.shipment.id) ?? []
  booking.value = list[0] ?? null
}

onMounted(load)
</script>

<template>
  <VCard variant="outlined" class="mt-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
      <VIcon icon="tabler-train" size="18" color="primary" class="me-2" />
      {{ $gettext('Rail Booking') }}
      <VSpacer />
      <template v-if="editable && !editing">
        <VBtn v-if="!booking" size="small" color="primary" variant="outlined" @click="startEdit">
          <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Rail Booking') }}
        </VBtn>
        <template v-else>
          <VBtn size="small" variant="outlined" class="me-2" @click="startEdit">
            <VIcon start icon="tabler-pencil" size="14" />{{ $gettext('Edit') }}
          </VBtn>
          <VBtn size="small" variant="outlined" color="error" @click="remove">
            <VIcon start icon="tabler-trash" size="14" />{{ $gettext('Remove') }}
          </VBtn>
        </template>
      </template>
    </VCardTitle>

    <VCardText class="pt-2">
      <div v-if="!booking && !editing" class="text-caption text-disabled">
        {{ $gettext('No rail booking added.') }}
      </div>

      <template v-if="booking && !editing">
        <VRow dense>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Train Service') }}</div>
            <div>{{ booking.trainService ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Operator') }}</div>
            <div>{{ booking.operator ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Container Count') }}</div>
            <div>{{ booking.containerCount ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Departure ICD') }}</div>
            <div>{{ booking.departureIcd ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Arrival ICD') }}</div>
            <div>{{ booking.arrivalIcd ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Departure Date') }}</div>
            <div>{{ booking.departureDate ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Arrival Date') }}</div>
            <div>{{ booking.arrivalDate ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('CIM Waybill No.') }}</div>
            <div>{{ booking.cimWaybillNumber ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('CIM Waybill Date') }}</div>
            <div>{{ booking.cimWaybillDate ?? '—' }}</div>
          </VCol>
          <VCol cols="12" v-if="booking.note">
            <div class="text-caption text-disabled">{{ $gettext('Note') }}</div>
            <div>{{ booking.note }}</div>
          </VCol>
        </VRow>
      </template>

      <template v-if="editing">
        <VRow dense>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.trainService" :label="$gettext('Train Service')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.operator" :label="$gettext('Rail Operator')" density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.departureIcd" :label="$gettext('Departure ICD')" placeholder="CNCTU"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.arrivalIcd" :label="$gettext('Arrival ICD')" placeholder="DEHAM"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.departureDate" :label="$gettext('Departure Date')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.arrivalDate" :label="$gettext('Arrival Date')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="form.cimWaybillNumber" :label="$gettext('CIM Waybill No.')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="form.cimWaybillDate" :label="$gettext('CIM Waybill Date')" type="date"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="form.containerCount" :label="$gettext('Container Count')" type="number"
              density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.note" :label="$gettext('Note')" density="compact" />
          </VCol>
        </VRow>
        <div class="d-flex justify-end mt-2 gap-2">
          <VBtn variant="text" @click="cancelEdit">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
        </div>
      </template>
    </VCardText>
  </VCard>
</template>
