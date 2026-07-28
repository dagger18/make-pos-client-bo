<script setup>
import { useGettext } from 'vue3-gettext'
import PortalQuoteRequestService from '@/services/portal/PortalQuoteRequestService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const router = useRouter()
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const form = ref({
  transportMode: 'SEA',
  serviceType: 'FCL',
  origin: '',
  destination: '',
  cargoDescription: '',
  weightKg: '',
  volumeCbm: '',
  containerType: '',
  incoterm: '',
  cargoReadyDate: '',
  specialRequirements: '',
})

const transportModes = ['SEA', 'AIR', 'ROAD', 'RAIL']
const serviceTypes   = ['FCL', 'LCL', 'AIR', 'EXPRESS', 'CUSTOMS']
const containerTypes = ['20GP', '40GP', '40HC', '45HC', '20RF', '40RF']
const incoterms      = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'CPT', 'FCA']

const myRequests = ref([])
onMounted(async () => {
  myRequests.value = await PortalQuoteRequestService.list() ?? []
})

async function submit() {
  if (!form.value.origin || !form.value.destination) {
    error.value = $gettext('Origin and destination are required.')
    return
  }
  error.value = ''
  submitting.value = true
  try {
    await PortalQuoteRequestService.submit({ ...form.value })
    submitted.value = true
    myRequests.value = await PortalQuoteRequestService.list() ?? []
    form.value = {
      transportMode: 'SEA', serviceType: 'FCL', origin: '', destination: '',
      cargoDescription: '', weightKg: '', volumeCbm: '', containerType: '',
      incoterm: '', cargoReadyDate: '', specialRequirements: '',
    }
  } catch {
    error.value = $gettext('Submission failed. Please try again.')
  }
  submitting.value = false
}

const statusColor = (s) => ({ RECEIVED: 'info', IN_PROGRESS: 'warning', QUOTED: 'success', CLOSED: 'default' }[s] ?? 'default')
</script>
<template>
  <div>
    <h1 class="text-h5 mb-6">{{ $gettext('Request a Freight Quote') }}</h1>

    <VAlert v-if="submitted" type="success" class="mb-4" closable @click:close="submitted = false">
      {{ $gettext('Your quote request has been submitted. Our team will be in touch shortly.') }}
    </VAlert>
    <VAlert v-if="error" type="error" class="mb-4" density="compact">{{ error }}</VAlert>

    <VCard class="mb-6">
      <VCardTitle>{{ $gettext('New Request') }}</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VSelect v-model="form.transportMode" :items="transportModes" :label="$gettext('Transport Mode')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.serviceType" :items="serviceTypes" :label="$gettext('Service Type')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.origin" :label="$gettext('Origin')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.destination" :label="$gettext('Destination')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.cargoDescription" :label="$gettext('Cargo Description')" density="compact" rows="3" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.weightKg" :label="$gettext('Weight (kg)')" type="number" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.volumeCbm" :label="$gettext('Volume (CBM)')" type="number" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="form.containerType" :items="['', ...containerTypes]" :label="$gettext('Container Type')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="form.incoterm" :items="['', ...incoterms]" :label="$gettext('Incoterm')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.cargoReadyDate" :label="$gettext('Cargo Ready Date')" type="date" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.specialRequirements" :label="$gettext('Special Requirements')" density="compact" rows="2" />
          </VCol>
          <VCol cols="12">
            <VBtn color="primary" :loading="submitting" @click="submit">
              {{ $gettext('Submit Request') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard v-if="myRequests.length">
      <VCardTitle>{{ $gettext('My Previous Requests') }}</VCardTitle>
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Date') }}</th>
            <th>{{ $gettext('Mode') }}</th>
            <th>{{ $gettext('Origin → Destination') }}</th>
            <th>{{ $gettext('Status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in myRequests" :key="r.id">
            <td>{{ r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' }}</td>
            <td>{{ r.transportMode }}</td>
            <td>{{ r.origin }} → {{ r.destination }}</td>
            <td><VChip size="small" :color="statusColor(r.status)">{{ r.status }}</VChip></td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
