<script setup>
// VesselRollService removed - freight-specific service
const VesselRollService = null;

const props = defineProps({
  shipment: { type: Object, default: () => ({}) },
})

const rolls = ref([])
const loading = ref(false)
const dialogOpen = ref(false)

const form = reactive({
  originalSailingRef: '',
  originalEtd: '',
  newSailingRef: '',
  newEtd: '',
  reason: '',
})

async function loadRolls() {
  if (!props.shipment?.id) return
  loading.value = true
  try {
    rolls.value = await VesselRollService.list(props.shipment.id) ?? []
  } finally {
    loading.value = false
  }
}

function openDialog() {
  Object.assign(form, {
    originalSailingRef: '',
    originalEtd: '',
    newSailingRef: '',
    newEtd: '',
    reason: '',
  })
  dialogOpen.value = true
}

async function submitRoll() {
  await VesselRollService.create({ ...form, shipmentId: props.shipment.id })
  dialogOpen.value = false
  await loadRolls()
}

async function markNotified(id) {
  await VesselRollService.markNotified(id)
  await loadRolls()
}

onMounted(loadRolls)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3">
      <span class="text-subtitle-1 font-weight-medium">{{ $gettext('Vessel Rolls') }}</span>
      <VSpacer />
      <VBtn
        size="small"
        color="warning"
        prepend-icon="tabler-rotate-clockwise"
        @click="openDialog"
      >
        {{ $gettext('Record Roll') }}
      </VBtn>
    </div>

    <VTable v-if="rolls.length > 0" density="compact">
      <thead>
        <tr>
          <th>{{ $gettext('Rolled At') }}</th>
          <th>{{ $gettext('Original Sailing Ref') }}</th>
          <th>{{ $gettext('Original ETD') }}</th>
          <th>{{ $gettext('New Sailing Ref') }}</th>
          <th>{{ $gettext('New ETD') }}</th>
          <th>{{ $gettext('Reason') }}</th>
          <th>{{ $gettext('Customer Notified') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="roll in rolls" :key="roll.id">
          <td>{{ roll.rolledAt ? roll.rolledAt.slice(0, 16).replace('T', ' ') : '—' }}</td>
          <td>{{ roll.originalSailingRef ?? '—' }}</td>
          <td>{{ roll.originalEtd ? roll.originalEtd.slice(0, 10) : '—' }}</td>
          <td>{{ roll.newSailingRef ?? '—' }}</td>
          <td>{{ roll.newEtd ? roll.newEtd.slice(0, 10) : '—' }}</td>
          <td>{{ roll.reason ?? '—' }}</td>
          <td>
            <VChip v-if="roll.notifiedAt" size="x-small" color="success">{{ $gettext('Yes') }}</VChip>
            <VChip v-else size="x-small" color="warning">{{ $gettext('Pending') }}</VChip>
          </td>
          <td>
            <VBtn
              v-if="!roll.notifiedAt"
              size="x-small"
              variant="text"
              @click="markNotified(roll.id)"
            >
              {{ $gettext('Mark Notified') }}
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>

    <p v-else-if="!loading" class="text-medium-emphasis text-caption">
      {{ $gettext('No vessel rolls recorded.') }}
    </p>

    <VDialog v-model="dialogOpen" max-width="520">
      <VCard :title="$gettext('Record Vessel Roll')">
        <VCardText>
          <VRow dense>
            <VCol cols="6">
              <VTextField
                v-model="form.originalSailingRef"
                :label="$gettext('Original Sailing Ref')"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="form.originalEtd"
                :label="$gettext('Original ETD')"
                type="date"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="form.newSailingRef"
                :label="$gettext('New Sailing Ref')"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="form.newEtd"
                :label="$gettext('New ETD')"
                type="date"
                density="compact"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.reason"
                :label="$gettext('Reason for Roll')"
                density="compact"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="warning" @click="submitRoll">{{ $gettext('Record Roll') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
