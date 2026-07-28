<script setup>
import FlightScheduleService from '@/services/FlightScheduleService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Provider' } })

const { $gettext } = useGettext()

const origin    = ref('')
const dest      = ref('')
const _now      = new Date()
const _pad      = n => String(n).padStart(2, '0')
const date      = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`)
const results   = ref([])
const loading   = ref(false)

function fmtDateTime(v) {
  return v ? v.slice(0, 16).replace('T', ' ') : '—'
}

async function search() {
  if (!origin.value || !dest.value) return
  loading.value = true
  try {
    results.value = (await FlightScheduleService.search(
      origin.value.toUpperCase(),
      dest.value.toUpperCase(),
      date.value,
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
          v-model="origin"
          :label="$gettext('Origin (IATA)')"
          density="compact"
          hide-details
          placeholder="SIN"
          @keyup.enter="search"
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField
          v-model="dest"
          :label="$gettext('Destination (IATA)')"
          density="compact"
          hide-details
          placeholder="LHR"
          @keyup.enter="search"
        />
      </VCol>
      <VCol cols="12" sm="2">
        <VTextField
          v-model="date"
          :label="$gettext('Date')"
          type="date"
          density="compact"
          hide-details
        />
      </VCol>
      <VCol cols="auto">
        <VBtn
          color="info"
          prepend-icon="tabler-plane"
          :loading="loading"
          :disabled="!origin || !dest"
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
            <th>{{ $gettext('Flight') }}</th>
            <th>{{ $gettext('Airline') }}</th>
            <th>{{ $gettext('STD') }}</th>
            <th>{{ $gettext('STA') }}</th>
            <th>{{ $gettext('Cargo Cutoff') }}</th>
            <th>{{ $gettext('Doc Cutoff') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center pa-4">
              <VProgressCircular indeterminate size="24" />
            </td>
          </tr>
          <tr v-else-if="results.length === 0 && origin && dest">
            <td colspan="6" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('No flights found. Try a different date or route.') }}
            </td>
          </tr>
          <tr v-else-if="!origin || !dest">
            <td colspan="6" class="text-center text-medium-emphasis pa-4">
              {{ $gettext('Enter origin and destination IATA codes then click Search.') }}
            </td>
          </tr>
          <tr v-for="f in results" :key="f.id ?? f.flightNo">
            <td class="font-weight-medium">{{ f.flightNo }}</td>
            <td>{{ f.carrierName ?? f.carrierIata }}</td>
            <td>{{ fmtDateTime(f.std) }}</td>
            <td>{{ fmtDateTime(f.sta) }}</td>
            <td>{{ fmtDateTime(f.cargoCutOff) }}</td>
            <td>{{ fmtDateTime(f.docCutOff) }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </VContainer>
</template>
