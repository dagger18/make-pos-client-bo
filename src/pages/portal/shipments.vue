<script setup>
import { useGettext } from 'vue3-gettext'
import PortalShipmentService from '@/services/portal/PortalShipmentService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const shipments = ref([])
const loading = ref(true)

onMounted(async () => {
  shipments.value = await PortalShipmentService.list('limit=100') ?? []
  loading.value = false
})
</script>
<template>
  <div>
    <h1 class="text-h5 mb-6">{{ $gettext('My Shipments') }}</h1>
    <VCard :loading="loading">
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Code') }}</th>
            <th>{{ $gettext('Mode') }}</th>
            <th>{{ $gettext('Origin') }}</th>
            <th>{{ $gettext('Destination') }}</th>
            <th>{{ $gettext('ETD') }}</th>
            <th>{{ $gettext('ETA') }}</th>
            <th>{{ $gettext('Status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in shipments"
            :key="s.id"
            style="cursor:pointer"
            @click="$router.push(`/portal/shipments/${s.id}`)"
          >
            <td class="font-weight-medium">{{ s.code }}</td>
            <td>{{ s.transportMode }}</td>
            <td>{{ s.pol }}</td>
            <td>{{ s.pod }}</td>
            <td>{{ s.etd }}</td>
            <td>{{ s.eta }}</td>
            <td><VChip size="small">{{ s.status }}</VChip></td>
          </tr>
          <tr v-if="!shipments.length && !loading">
            <td colspan="7" class="text-center text-medium-emphasis py-6">{{ $gettext('No shipments found') }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
