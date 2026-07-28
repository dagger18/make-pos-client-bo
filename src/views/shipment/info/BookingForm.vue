<script setup>
import { CBM } from '@/config/enums/Unit';
import { layout, makeDefaultEntity } from '@/config/forms/shipment/Booking';
// BookingService removed - freight-specific service
const EntityService = null;
import { transformObject, transformPreSubmit } from '@/services/CommonService';
// VesselSailingService removed - freight-specific service
const VesselSailingService = null;
// FlightScheduleService removed - freight-specific service
const FlightScheduleService = null;
const props = defineProps({
  parentBind: { type: Object, default: () => {} },
  shipment: { type: Object, default: () => {}}
})
const form = ref(null)
function setEntity(entity = null) {
  form.value.setEntity(entity)
}
const quote = props.shipment.quote

// Track the current entity so pickers can read/write sub-form fields
const currentEntity = ref(null)

function entityPreForm (entity) {
  entity.transportType = quote.transportType
  const {
    placeReceipt, portLoading, pickup, etd,
    vesselNo, warehouse,
    cyCutOff, siCutOff, vgmCutOff, gateIn,
    temperature, vent, freightTerms, terms,
    sailingRef,

    portDischarge, placeDelivery, destination, eta,
    flightRef,

    commodities, cargoVolume,

    contactNumber, contactDate
  } = entity

  entity.originSubForm = {
    placeReceipt, portLoading, pickup, etd,
    vesselNo, warehouse,
    cyCutOff, siCutOff, vgmCutOff, gateIn,
    temperature, vent, freightTerms, terms,
    sailingRef,
    transportType: quote.transportType,
    provider: quote.provider,
    carrier: quote.carrier
  }

  entity.destinationSubForm = {
    portDischarge, placeDelivery, destination, eta,
    flightRef,
    transportType: quote.transportType
  }

  entity.consignmentSubForm = {
    commodities,
    ...cargoVolume,
    cargoVolumeType: quote.cargoVolumeType
  }

  entity.contactSubForm = {
    contactNumber, contactDate
  }

  const merged = Object.assign(JSON.parse(JSON.stringify(props.parentBind)), entity)
  currentEntity.value = merged
  return merged
}
function entityPreSubmit (reactedAntity) {
  let entity = JSON.parse(JSON.stringify(reactedAntity))
  const {
    placeReceipt, portLoading, pickup, etd,
    vesselNo, warehouse,
    cyCutOff, siCutOff, vgmCutOff, gateIn,
    temperature, vent, freightTerms, terms,
    sailingRef
  } = entity.originSubForm
  const {
    portDischarge, placeDelivery, destination, eta,
    flightRef
  } = entity.destinationSubForm

  const {
    commodities,
    totalUnit, totalWeight, totalCBM
  } = entity.consignmentSubForm
  const {
    contactNumber, contactDate
  } = entity.contactSubForm

  entity = {
    ...entity,
    placeReceipt, portLoading, pickup, etd,
    vesselNo, warehouse,
    cyCutOff, siCutOff, vgmCutOff, gateIn,
    temperature, vent, freightTerms, terms,
    sailingRef,

    portDischarge, placeDelivery, destination, eta,
    flightRef,

    commodities,
    cargoVolume: {
      items: entity.cargoVolume.items,
      totalUnit, totalWeight, totalCBM,
      chargeableWeight: Math.max(totalWeight, totalCBM * CBM.KGS[entity.transportType]).round(2)
    },

    contactNumber, contactDate
  }
  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
  if (entity.cargoVolume) {
    transformObject(entity, 'cargoVolume')
  }
  console.log('final object', JSON.parse(JSON.stringify(entity)))

  return entity
}
defineExpose({
  setEntity
})

// ── Sailing picker state ────────────────────────────────────────────────────
const sailingPickerOpen = ref(false)
const sailingSearchResults = ref([])
const sailingSearchLoading = ref(false)
const sailingSearchPol = ref('')
const sailingSearchPod = ref('')
const sailingSearchDate = ref(new Date().toISOString().slice(0, 10))

// ── Flight picker state ─────────────────────────────────────────────────────
const flightPickerOpen = ref(false)
const flightSearchResults = ref([])
const flightSearchLoading = ref(false)
const flightSearchOrigin = ref('')
const flightSearchDest = ref('')
const flightSearchDate = ref(new Date().toISOString().slice(0, 10))

// ── Sailing picker functions ────────────────────────────────────────────────
function openSailingPicker() {
  const origin = currentEntity.value?.originSubForm ?? {}
  sailingSearchPol.value = origin.portLoading?.code ?? origin.portLoading ?? ''
  sailingSearchPod.value = currentEntity.value?.destinationSubForm?.portDischarge?.code
    ?? currentEntity.value?.destinationSubForm?.portDischarge ?? ''
  sailingSearchResults.value = []
  sailingPickerOpen.value = true
}

async function searchSailings() {
  if (!sailingSearchPol.value || !sailingSearchPod.value) return
  sailingSearchLoading.value = true
  try {
    const etdTo = new Date(sailingSearchDate.value)
    etdTo.setDate(etdTo.getDate() + 60)
    sailingSearchResults.value = await VesselSailingService.search(
      sailingSearchPol.value,
      sailingSearchPod.value,
      sailingSearchDate.value,
      etdTo.toISOString().slice(0, 10)
    ) ?? []
  } finally {
    sailingSearchLoading.value = false
  }
}

function selectSailing(sailing) {
  if (!currentEntity.value) return
  const origin = currentEntity.value.originSubForm ?? {}
  const dest = currentEntity.value.destinationSubForm ?? {}
  if (sailing.etd) origin.etd = sailing.etd.slice(0, 10)
  if (sailing.eta) dest.eta = sailing.eta.slice(0, 10)
  if (sailing.vessel) { origin.vesselNo = sailing.vessel; origin.motherVessel = sailing.vessel }
  if (sailing.voyageNo) origin.motherVoyage = sailing.voyageNo
  if (sailing.siCutOff) origin.siCutOff = sailing.siCutOff.slice(0, 10)
  if (sailing.vgmCutOff) origin.vgmCutOff = sailing.vgmCutOff.slice(0, 10)
  if (sailing.cyCutOff) origin.cyCutOff = sailing.cyCutOff.slice(0, 10)
  origin.sailingRef = sailing.id ? String(sailing.id) : null
  // Push the updated entity back into AppForm so the UI reflects changes
  form.value.setEntity(currentEntity.value)
  sailingPickerOpen.value = false
}

// ── Flight picker functions ─────────────────────────────────────────────────
function openFlightPicker() {
  const origin = currentEntity.value?.originSubForm ?? {}
  flightSearchOrigin.value = origin.portLoading?.code ?? origin.portLoading ?? ''
  flightSearchDest.value = currentEntity.value?.destinationSubForm?.portDischarge?.code
    ?? currentEntity.value?.destinationSubForm?.portDischarge ?? ''
  flightSearchResults.value = []
  flightPickerOpen.value = true
}

async function searchFlights() {
  if (!flightSearchOrigin.value || !flightSearchDest.value) return
  flightSearchLoading.value = true
  try {
    flightSearchResults.value = await FlightScheduleService.search(
      flightSearchOrigin.value,
      flightSearchDest.value,
      flightSearchDate.value
    ) ?? []
  } finally {
    flightSearchLoading.value = false
  }
}

function selectFlight(flight) {
  if (!currentEntity.value) return
  const origin = currentEntity.value.originSubForm ?? {}
  const dest = currentEntity.value.destinationSubForm ?? {}
  if (flight.std) origin.etd = flight.std.slice(0, 10)
  if (flight.sta) dest.eta = flight.sta.slice(0, 10)
  if (flight.flightNo) origin.vesselNo = flight.flightNo
  if (flight.docCutOff) origin.siCutOff = flight.docCutOff.slice(0, 10)
  if (flight.cargoCutOff) origin.cyCutOff = flight.cargoCutOff.slice(0, 10)
  dest.flightRef = flight.id ? String(flight.id) : null
  // Push the updated entity back into AppForm so the UI reflects changes
  form.value.setEntity(currentEntity.value)
  flightPickerOpen.value = false
}
</script>
<template>
  <div>
    <!-- Vessel/Flight schedule picker buttons -->
    <div class="d-flex gap-2 mx-4 mt-3 mb-n2">
      <VBtn
        v-if="shipment?.mode !== 'AIR'"
        size="small"
        variant="tonal"
        color="primary"
        prepend-icon="tabler-ship"
        @click="openSailingPicker"
      >{{ $gettext('Search Sailing') }}</VBtn>

      <VBtn
        v-if="shipment?.mode === 'AIR'"
        size="small"
        variant="tonal"
        color="info"
        prepend-icon="tabler-plane"
        @click="openFlightPicker"
      >{{ $gettext('Search Flight') }}</VBtn>
    </div>

    <AppForm
      :layout="layout"
      :entityName="$gettext('Booking Information')"
      :makeDefaultEntity="makeDefaultEntity"
      :entityPreForm="entityPreForm"
      :entityPreSubmit="entityPreSubmit"
      :service="EntityService"
      :notRemoveScrollAfterSubmit="true"
      ref="form"
      :width="'800px'"
      @entitySubmitted="$emit('entitySubmitted', $event)"
    />

    <!-- Vessel Sailing Picker -->
    <VDialog v-model="sailingPickerOpen" max-width="900" scrollable>
      <VCard :title="$gettext('Search Vessel Sailing')">
        <VCardText>
          <VRow class="mb-3" dense>
            <VCol cols="3">
              <VTextField v-model="sailingSearchPol" :label="$gettext('POL (UN/LOCODE)')" density="compact" hide-details />
            </VCol>
            <VCol cols="3">
              <VTextField v-model="sailingSearchPod" :label="$gettext('POD (UN/LOCODE)')" density="compact" hide-details />
            </VCol>
            <VCol cols="3">
              <VTextField v-model="sailingSearchDate" :label="$gettext('ETD From')" type="date" density="compact" hide-details />
            </VCol>
            <VCol cols="3" class="d-flex align-end">
              <VBtn block color="primary" :loading="sailingSearchLoading" @click="searchSailings">
                {{ $gettext('Search') }}
              </VBtn>
            </VCol>
          </VRow>
          <VTable v-if="sailingSearchResults.length > 0" density="compact" hover>
            <thead>
              <tr>
                <th>{{ $gettext('Carrier') }}</th>
                <th>{{ $gettext('Vessel') }}</th>
                <th>{{ $gettext('Voyage') }}</th>
                <th>{{ $gettext('Service') }}</th>
                <th>{{ $gettext('ETD') }}</th>
                <th>{{ $gettext('ETA') }}</th>
                <th>{{ $gettext('Transit') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sailingSearchResults" :key="s.id ?? s.voyageNo">
                <td>{{ s.carrier }}</td>
                <td>{{ s.vessel }}</td>
                <td>{{ s.voyageNo }}</td>
                <td>{{ s.service }}</td>
                <td>{{ s.etd ? s.etd.slice(0, 10) : '—' }}</td>
                <td>{{ s.eta ? s.eta.slice(0, 10) : '—' }}</td>
                <td>{{ s.transitDays != null ? s.transitDays + 'd' : '—' }}</td>
                <td>
                  <VBtn size="x-small" color="primary" @click="selectSailing(s)">{{ $gettext('Select') }}</VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
          <p v-else-if="!sailingSearchLoading" class="text-medium-emphasis text-caption mt-2">
            {{ $gettext('Enter POL and POD then click Search.') }}
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="sailingPickerOpen = false">{{ $gettext('Cancel') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Flight Schedule Picker -->
    <VDialog v-model="flightPickerOpen" max-width="860" scrollable>
      <VCard :title="$gettext('Search Flight Schedule')">
        <VCardText>
          <VRow class="mb-3" dense>
            <VCol cols="3">
              <VTextField v-model="flightSearchOrigin" :label="$gettext('Origin (IATA)')" density="compact" hide-details />
            </VCol>
            <VCol cols="3">
              <VTextField v-model="flightSearchDest" :label="$gettext('Destination (IATA)')" density="compact" hide-details />
            </VCol>
            <VCol cols="3">
              <VTextField v-model="flightSearchDate" :label="$gettext('Date')" type="date" density="compact" hide-details />
            </VCol>
            <VCol cols="3" class="d-flex align-end">
              <VBtn block color="info" :loading="flightSearchLoading" @click="searchFlights">
                {{ $gettext('Search') }}
              </VBtn>
            </VCol>
          </VRow>
          <VTable v-if="flightSearchResults.length > 0" density="compact" hover>
            <thead>
              <tr>
                <th>{{ $gettext('Flight') }}</th>
                <th>{{ $gettext('Airline') }}</th>
                <th>{{ $gettext('STD') }}</th>
                <th>{{ $gettext('STA') }}</th>
                <th>{{ $gettext('Cargo Cutoff') }}</th>
                <th>{{ $gettext('Doc Cutoff') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in flightSearchResults" :key="f.id ?? f.flightNo">
                <td>{{ f.flightNo }}</td>
                <td>{{ f.carrierName ?? f.carrierIata }}</td>
                <td>{{ f.std ? f.std.slice(0, 16).replace('T', ' ') : '—' }}</td>
                <td>{{ f.sta ? f.sta.slice(0, 16).replace('T', ' ') : '—' }}</td>
                <td>{{ f.cargoCutOff ? f.cargoCutOff.slice(0, 16).replace('T', ' ') : '—' }}</td>
                <td>{{ f.docCutOff ? f.docCutOff.slice(0, 16).replace('T', ' ') : '—' }}</td>
                <td>
                  <VBtn size="x-small" color="info" @click="selectFlight(f)">{{ $gettext('Select') }}</VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
          <p v-else-if="!flightSearchLoading" class="text-medium-emphasis text-caption mt-2">
            {{ $gettext('Enter origin and destination IATA codes then click Search.') }}
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="flightPickerOpen = false">{{ $gettext('Cancel') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
