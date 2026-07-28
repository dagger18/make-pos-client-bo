<script setup>
import EmissionsService from '@/services/EmissionsService'

const props = defineProps({ shipment: { type: Object, required: true } })

const records      = ref([])
const factors      = ref([])
const loading      = ref(false)
const saving       = ref(false)
const calcDialog   = ref(false)
const manualDialog = ref(false)

const MODES = ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
const MODE_COLOR = { OCN: 'info', AIR: 'primary', RD: 'warning', RAL: 'success', COU: 'secondary', MMD: 'default' }

const calcForm = ref({ transportMode: 'OCN', distanceKm: null, legSequence: 1, legDescription: '' })
const manualForm = ref({
  transportMode: 'OCN', emissionFactorId: null,
  distanceKm: null, cargoWeightTonnes: null,
  co2eTtwKg: null, co2eWtwKg: null,
  methodology: 'GLEC_V3', isEstimate: true,
  legSequence: 1, legDescription: 'Manual entry',
})

const totals = computed(() => ({
  ttw: records.value.reduce((s, r) => s + Number(r.co2eTtwKg ?? 0), 0),
  wtw: records.value.reduce((s, r) => s + Number(r.co2eWtwKg ?? 0), 0),
}))

async function load() {
  loading.value = true
  records.value = await EmissionsService.listForShipment(props.shipment.id)
  loading.value = false
}

async function loadFactors() {
  factors.value = await EmissionsService.listFactors()
}

async function calculate() {
  saving.value = true
  try {
    const payload = {
      transportMode: calcForm.value.transportMode,
      distanceKm: calcForm.value.distanceKm || null,
      legSequence: calcForm.value.legSequence,
      legDescription: calcForm.value.legDescription || null,
    }
    await EmissionsService.calculate(props.shipment.id, payload)
    calcDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function saveManual() {
  saving.value = true
  try {
    await EmissionsService.createManual({
      ...manualForm.value,
      shipmentId: props.shipment.id,
      distanceKm: manualForm.value.distanceKm || 0,
      cargoWeightTonnes: manualForm.value.cargoWeightTonnes || 1,
    })
    manualDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this emission record?')) return
  await EmissionsService.deleteRecord(id)
  await load()
}

const fmt2 = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt0 = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const factorLabel = (f) =>
  `${f.transportMode} — ${f.vehicleType ?? ''}${f.sizeClass ? ' (' + f.sizeClass + ')' : ''} EF=${Number(f.efTtw).toFixed(5)}`

onMounted(() => { load(); loadFactors() })
</script>

<template>
  <VCard flat>
    <VCardText>
      <!-- Summary row -->
      <VRow class="mb-4" v-if="records.length">
        <VCol cols="6" sm="3">
          <div class="text-caption text-disabled">{{ $gettext('Records') }}</div>
          <div class="text-h6 font-weight-bold">{{ records.length }}</div>
        </VCol>
        <VCol cols="6" sm="3">
          <div class="text-caption text-disabled">{{ $gettext('CO₂e TTW (kg)') }}</div>
          <div class="text-h6 font-weight-bold text-success">{{ fmt2(totals.ttw) }}</div>
        </VCol>
        <VCol cols="6" sm="3">
          <div class="text-caption text-disabled">{{ $gettext('CO₂e WTW (kg)') }}</div>
          <div class="text-h6 font-weight-bold text-warning">{{ fmt2(totals.wtw) }}</div>
        </VCol>
      </VRow>

      <VRow v-if="loading" justify="center" class="py-6">
        <VProgressCircular indeterminate color="primary" />
      </VRow>

      <template v-else>
        <VTable density="compact" class="mb-4" v-if="records.length">
          <thead>
            <tr>
              <th>{{ $gettext('Leg') }}</th>
              <th>{{ $gettext('Mode') }}</th>
              <th class="text-right">{{ $gettext('Distance km') }}</th>
              <th class="text-right">{{ $gettext('Weight t') }}</th>
              <th class="text-right">{{ $gettext('Tonne-km') }}</th>
              <th class="text-right">{{ $gettext('CO₂e TTW kg') }}</th>
              <th class="text-right">{{ $gettext('CO₂e WTW kg') }}</th>
              <th>{{ $gettext('Method') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id">
              <td>
                <span class="text-caption">{{ r.legDescription }}</span>
                <VChip v-if="r.isEstimate" size="x-small" color="warning" class="ms-1">Est.</VChip>
              </td>
              <td><VChip size="x-small" :color="MODE_COLOR[r.transportMode] ?? 'default'">{{ r.transportMode }}</VChip></td>
              <td class="text-right">{{ fmt0(r.distanceKm) }}</td>
              <td class="text-right">{{ fmt2(r.cargoWeightTonnes) }}</td>
              <td class="text-right">{{ fmt0(r.tonneKm) }}</td>
              <td class="text-right font-weight-medium text-success">{{ fmt2(r.co2eTtwKg) }}</td>
              <td class="text-right">{{ fmt2(r.co2eWtwKg) }}</td>
              <td class="text-caption">{{ r.methodology }}</td>
              <td>
                <VBtn size="x-small" icon variant="text" color="error" @click="remove(r.id)">
                  <VIcon>tabler-trash</VIcon>
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <VAlert v-else type="info" variant="tonal" density="compact" class="mb-4">
          {{ $gettext('No emission records yet. Use Auto-Calculate to generate an estimate from shipment data.') }}
        </VAlert>

        <div class="d-flex gap-2">
          <VBtn
            color="success" prepend-icon="tabler-leaf" variant="tonal"
            @click="calcDialog = true"
          >
            {{ $gettext('Auto-Calculate') }}
          </VBtn>
          <VBtn
            color="default" prepend-icon="tabler-edit" variant="tonal"
            @click="manualDialog = true"
          >
            {{ $gettext('Enter Manually') }}
          </VBtn>
        </div>
      </template>
    </VCardText>
  </VCard>

  <!-- Auto-Calculate Dialog -->
  <VDialog v-model="calcDialog" max-width="480px">
    <VCard :title="$gettext('Auto-Calculate CO₂ Emissions')">
      <VCardText>
        <p class="text-caption text-disabled mb-4">
          {{ $gettext('Uses shipment cargo weight + emission factor. For OCN, distance is looked up from the sea distance table using the booking ports.') }}
        </p>
        <VRow dense>
          <VCol cols="12" md="6">
            <VSelect v-model="calcForm.transportMode" :items="MODES" :label="$gettext('Transport Mode')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model.number="calcForm.distanceKm"
              type="number" :label="$gettext('Distance km (optional override)')"
              density="compact" clearable
              hint="Leave blank for OCN auto-lookup"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="calcForm.legSequence" type="number" :label="$gettext('Leg #')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="calcForm.legDescription" :label="$gettext('Leg Description')" density="compact" clearable
              placeholder="e.g. Ocean leg, Pre-carriage" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="calcDialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="success" :loading="saving" @click="calculate">{{ $gettext('Calculate & Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Manual Entry Dialog -->
  <VDialog v-model="manualDialog" max-width="600px">
    <VCard :title="$gettext('Enter Emission Data Manually')">
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="4">
            <VSelect v-model="manualForm.transportMode" :items="MODES" :label="$gettext('Mode')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="manualForm.distanceKm" type="number" :label="$gettext('Distance km')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="manualForm.cargoWeightTonnes" type="number" :label="$gettext('Weight (tonnes)')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="manualForm.emissionFactorId"
              :items="factors"
              :item-title="factorLabel"
              item-value="id"
              :label="$gettext('Emission Factor (auto-fills CO₂)')"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="manualForm.co2eTtwKg" type="number" step="0.01"
              :label="$gettext('CO₂e TTW (kg)')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="manualForm.co2eWtwKg" type="number" step="0.01"
              :label="$gettext('CO₂e WTW (kg)')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="manualForm.methodology" :label="$gettext('Methodology')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model.number="manualForm.legSequence" type="number" :label="$gettext('Leg #')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VSwitch v-model="manualForm.isEstimate" :label="$gettext('Is Estimate')" density="compact" hide-details />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="manualForm.legDescription" :label="$gettext('Leg Description')" density="compact" clearable />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="manualDialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="saveManual">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
