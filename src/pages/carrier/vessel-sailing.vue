<script setup>
import VesselSailingService from '@/services/VesselSailingService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Provider' } })

const { $gettext } = useGettext()

const pol      = ref('')
const pod      = ref('')
const _now     = new Date()
const _pad     = n => String(n).padStart(2, '0')
const etdFrom  = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`)
const results  = ref([])
const loading  = ref(false)

const etdTo = computed(() => {
  const d = new Date(etdFrom.value)
  d.setDate(d.getDate() + 60)
  return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`
})

async function search() {
  if (!pol.value || !pod.value) return
  loading.value = true
  try {
    results.value = (await VesselSailingService.search(
      pol.value.toUpperCase(),
      pod.value.toUpperCase(),
      etdFrom.value,
      etdTo.value,
    )) ?? []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4" align="center">
      <VCol cols="12" sm="2">
        <VTextField
          v-model="pol"
          :label="$gettext('POL (UN/LOCODE)')"
          density="compact"
          hide-details
          placeholder="SGSIN"
          @keyup.enter="search"
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField
          v-model="pod"
          :label="$gettext('POD (UN/LOCODE)')"
          density="compact"
          hide-details
          placeholder="NLRTM"
          @keyup.enter="search"
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField
          v-model="etdFrom"
          :label="$gettext('ETD From')"
          type="date"
          density="compact"
          hide-details
        />
      </VCol>
      <VCol cols="auto" class="d-flex align-center text-medium-emphasis text-caption">
        {{ $gettext('to') }} {{ etdTo }} {{ $gettext('(+60 days)') }}
      </VCol>
      <VCol cols="auto">
        <VBtn
          color="primary"
          prepend-icon="tabler-ship"
          :loading="loading"
          :disabled="!pol || !pod"
          @click="search"
        >
          {{ $gettext('Search') }}
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>{{ $gettext('Carrier') }}</th>
            <th>{{ $gettext('Vessel') }}</th>
            <th>{{ $gettext('Voyage') }}</th>
            <th>{{ $gettext('Service') }}</th>
            <th>{{ $gettext('ETD') }}</th>
            <th>{{ $gettext('ETA') }}</th>
            <th>{{ $gettext('Transit') }}</th>
            <th>{{ $gettext('SI Cutoff') }}</th>
            <th>{{ $gettext('VGM Cutoff') }}</th>
            <th>{{ $gettext('CY Cutoff') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center pa-4">
              <VProgressCircular indeterminate size="24" />
            </td>
          </tr>
          <tr v-else-if="results.length === 0 && pol && pod">
            <td colspan="10" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('No sailings found. Try a wider date range or different ports.') }}
            </td>
          </tr>
          <tr v-else-if="!pol || !pod">
            <td colspan="10" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('Enter POL and POD then click Search.') }}
            </td>
          </tr>
          <tr v-for="s in results" :key="s.id ?? s.voyageNo">
            <td>{{ s.carrier }}</td>
            <td class="font-weight-medium">{{ s.vessel }}</td>
            <td>{{ s.voyageNo }}</td>
            <td>{{ s.service ?? '—' }}</td>
            <td>{{ s.etd ? s.etd.slice(0, 10) : '—' }}</td>
            <td>{{ s.eta ? s.eta.slice(0, 10) : '—' }}</td>
            <td>{{ s.transitDays != null ? s.transitDays + 'd' : '—' }}</td>
            <td>{{ s.siCutOff ? s.siCutOff.slice(0, 10) : '—' }}</td>
            <td>{{ s.vgmCutOff ? s.vgmCutOff.slice(0, 10) : '—' }}</td>
            <td>{{ s.cyCutOff ? s.cyCutOff.slice(0, 10) : '—' }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
