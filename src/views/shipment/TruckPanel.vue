<script setup>
import TruckService from '@/services/TruckService'
import ProviderService from '@/services/ProviderService'

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const truck = ref(null)
const editing = ref(false)
const saving = ref(false)
const form = ref(null)
const haulierOptions = ref([])

const truckTypes = [
  { value: 'BOX',         title: 'Box' },
  { value: 'CURTAINSIDER', title: 'Curtainsider' },
  { value: 'FLATBED',     title: 'Flatbed' },
  { value: 'REEFER',      title: 'Reefer' },
  { value: 'TANKER',      title: 'Tanker' },
]

function emptyForm() {
  return {
    truckType: '',
    payloadKg: null,
    truckPlate: null,
    driverName: null,
    haulierId: null,
    pickupAddress: null,
    deliveryAddress: null,
    scheduledPickup: null,
    scheduledDelivery: null,
    actualPickup: null,
    actualDelivery: null,
    podSignedBy: null,
    podImageUrl: null,
  }
}

function startEdit() {
  form.value = truck.value ? { ...truck.value, haulierId: truck.value.haulier?.id ?? null } : emptyForm()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  form.value = null
}

async function save() {
  saving.value = true
  const payload = { ...form.value }
  if (truck.value?.id) {
    await TruckService.update(props.shipment.id, truck.value.id, payload)
  } else {
    await TruckService.create(props.shipment.id, payload)
  }
  await load()
  editing.value = false
  saving.value = false
}

async function remove() {
  if (!truck.value) return
  await TruckService.delete(props.shipment.id, truck.value.id)
  truck.value = null
}

async function load() {
  const list = await TruckService.list(props.shipment.id) ?? []
  truck.value = list[0] ?? null
}

async function loadHauliers() {
  const res = await ProviderService.list('limit=-1')
  haulierOptions.value = res?.list ?? res?.data ?? res ?? []
}

onMounted(() => {
  load()
  loadHauliers()
})
</script>

<template>
  <VCard variant="outlined" class="mt-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
      <VIcon icon="tabler-truck" size="18" color="primary" class="me-2" />
      {{ $gettext('Truck Details') }}
      <VSpacer />
      <template v-if="editable && !editing">
        <VBtn v-if="!truck" size="small" color="primary" variant="outlined" @click="startEdit">
          <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Truck') }}
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
      <div v-if="!truck && !editing" class="text-caption text-disabled">
        {{ $gettext('No truck record added.') }}
      </div>

      <template v-if="truck && !editing">
        <VRow dense>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Truck Type') }}</div>
            <div>{{ truckTypes.find(t => t.value === truck.truckType)?.title ?? truck.truckType }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Plate') }}</div>
            <div>{{ truck.truckPlate ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Payload (kg)') }}</div>
            <div>{{ truck.payloadKg ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Driver') }}</div>
            <div>{{ truck.driverName ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="4">
            <div class="text-caption text-disabled">{{ $gettext('Haulier') }}</div>
            <div>{{ truck.haulier?.name ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-caption text-disabled">{{ $gettext('Pickup Address') }}</div>
            <div>{{ truck.pickupAddress ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-caption text-disabled">{{ $gettext('Delivery Address') }}</div>
            <div>{{ truck.deliveryAddress ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Sched. Pickup') }}</div>
            <div>{{ truck.scheduledPickup ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Sched. Delivery') }}</div>
            <div>{{ truck.scheduledDelivery ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Actual Pickup') }}</div>
            <div>{{ truck.actualPickup ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="3">
            <div class="text-caption text-disabled">{{ $gettext('Actual Delivery') }}</div>
            <div>{{ truck.actualDelivery ?? '—' }}</div>
          </VCol>
          <VCol cols="12" sm="6">
            <div class="text-caption text-disabled">{{ $gettext('POD Signed By') }}</div>
            <div>{{ truck.podSignedBy ?? '—' }}</div>
          </VCol>
        </VRow>
      </template>

      <template v-if="editing">
        <VRow dense>
          <VCol cols="12" sm="4">
            <VSelect v-model="form.truckType" :items="truckTypes" item-title="title" item-value="value"
              :label="$gettext('Truck Type')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="form.truckPlate" :label="$gettext('Plate Number')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="form.payloadKg" type="number" :label="$gettext('Payload (kg)')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.driverName" :label="$gettext('Driver Name')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect v-model="form.haulierId" :items="haulierOptions" item-title="name" item-value="id"
              :label="$gettext('Haulier')" density="compact" clearable />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.pickupAddress" :label="$gettext('Pickup Address')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.deliveryAddress" :label="$gettext('Delivery Address')" density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.scheduledPickup" :label="$gettext('Sched. Pickup')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.scheduledDelivery" :label="$gettext('Sched. Delivery')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.actualPickup" :label="$gettext('Actual Pickup')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField v-model="form.actualDelivery" :label="$gettext('Actual Delivery')" type="datetime-local"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.podSignedBy" :label="$gettext('POD Signed By')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="form.podImageUrl" :label="$gettext('POD Image URL')" density="compact" />
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
