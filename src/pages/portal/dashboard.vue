<script setup>
import { useGettext } from 'vue3-gettext'
import { usePortalAuthStore } from '@/stores/portalAuthStore'
import PortalShipmentService from '@/services/portal/PortalShipmentService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const portalStore = usePortalAuthStore()
const recentShipments = ref([])
const loading = ref(true)

onMounted(async () => {
  recentShipments.value = await PortalShipmentService.list('limit=5') ?? []
  loading.value = false
})
</script>
<template>
  <div>
    <h1 class="text-h5 mb-6">{{ $gettext('Welcome') }}, {{ portalStore.user?.email }}</h1>

    <VRow>
      <VCol cols="12" md="4">
        <VCard :to="'/portal/shipments'" hover>
          <VCardText class="text-center py-6">
            <VIcon icon="tabler-package-export" size="40" color="primary" class="mb-2" />
            <div class="text-h6">{{ $gettext('My Shipments') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ $gettext('Track active and historical jobs') }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard :to="'/portal/documents'" hover>
          <VCardText class="text-center py-6">
            <VIcon icon="tabler-file-download" size="40" color="primary" class="mb-2" />
            <div class="text-h6">{{ $gettext('Documents') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ $gettext('Download BL, invoices, and more') }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard :to="'/portal/quote-request'" hover>
          <VCardText class="text-center py-6">
            <VIcon icon="tabler-message-2-dollar" size="40" color="primary" class="mb-2" />
            <div class="text-h6">{{ $gettext('Request a Quote') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ $gettext('Submit a freight enquiry') }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mt-6" :loading="loading">
      <VCardTitle>{{ $gettext('Recent Shipments') }}</VCardTitle>
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Code') }}</th>
            <th>{{ $gettext('Mode') }}</th>
            <th>{{ $gettext('Origin → Destination') }}</th>
            <th>{{ $gettext('ETD') }}</th>
            <th>{{ $gettext('ETA') }}</th>
            <th>{{ $gettext('Status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in recentShipments" :key="s.id" style="cursor:pointer" @click="$router.push(`/portal/shipments/${s.id}`)">
            <td>{{ s.code }}</td>
            <td>{{ s.transportMode }}</td>
            <td>{{ s.pol }} → {{ s.pod }}</td>
            <td>{{ s.etd }}</td>
            <td>{{ s.eta }}</td>
            <td><VChip size="small">{{ s.status }}</VChip></td>
          </tr>
          <tr v-if="!recentShipments.length && !loading">
            <td colspan="6" class="text-center text-medium-emphasis py-4">{{ $gettext('No shipments found') }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
