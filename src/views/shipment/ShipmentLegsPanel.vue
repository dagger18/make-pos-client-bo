<script setup>
import ShipmentLegService from '@/services/ShipmentLegService'

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const legs = ref([])
const dialogOpen = ref(false)
const saving = ref(false)
const form = ref({ code: null, note: null })

function openAdd() {
  form.value = { code: null, note: null }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  await ShipmentLegService.create(props.shipment.id, form.value)
  dialogOpen.value = false
  await load()
  saving.value = false
}

async function remove(leg) {
  await ShipmentLegService.delete(props.shipment.id, leg.id)
  await load()
}

async function load() {
  legs.value = await ShipmentLegService.list(props.shipment.id) ?? []
}

onMounted(load)
</script>

<template>
  <VCard variant="outlined" class="mt-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
      <VIcon icon="tabler-route" size="18" color="primary" class="me-2" />
      {{ $gettext('Multimodal Sub-Legs') }}
      <VChip v-if="legs.length" color="primary" size="x-small" class="ms-2">{{ legs.length }}</VChip>
      <VSpacer />
      <VBtn v-if="editable" size="small" color="primary" variant="outlined" @click="openAdd">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Leg') }}
      </VBtn>
    </VCardTitle>

    <VCardText class="pt-2">
      <div v-if="legs.length === 0" class="text-caption text-disabled">
        {{ $gettext('No sub-legs added. Add legs to assign mode-specific operational data to each segment.') }}
      </div>
      <VTable v-else density="compact">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $gettext('Leg ID') }}</th>
            <th>{{ $gettext('Code') }}</th>
            <th>{{ $gettext('Note') }}</th>
            <th v-if="editable"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(leg, index) in legs" :key="leg.id">
            <td>{{ index + 1 }}</td>
            <td>
              <VChip size="x-small" label>{{ leg.id }}</VChip>
            </td>
            <td>{{ leg.code ?? '—' }}</td>
            <td>{{ leg.note ?? '—' }}</td>
            <td v-if="editable">
              <VBtn icon size="x-small" variant="plain" color="error" @click="remove(leg)">
                <VIcon icon="tabler-trash" size="14" />
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>

  <VDialog v-model="dialogOpen" max-width="480">
    <VCard :title="$gettext('Add Sub-Leg')">
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VTextField v-model="form.code" :label="$gettext('Leg Code')" placeholder="LEG-1-OCEAN"
              density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="form.note" :label="$gettext('Note')" density="compact" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Add') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
