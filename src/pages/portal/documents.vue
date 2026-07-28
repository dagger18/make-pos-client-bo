<script setup>
import { useGettext } from 'vue3-gettext'
import PortalDocumentService from '@/services/portal/PortalDocumentService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const documents = ref([])
const loading = ref(true)
const downloading = ref(null)

onMounted(async () => {
  documents.value = await PortalDocumentService.list() ?? []
  loading.value = false
})

async function download(doc) {
  downloading.value = doc.id
  try {
    const result = await PortalDocumentService.getDownloadUrl(doc.id)
    if (result?.url) {
      window.open(result.url, '_blank')
    }
  } finally {
    downloading.value = null
  }
}
</script>
<template>
  <div>
    <h1 class="text-h5 mb-6">{{ $gettext('Documents') }}</h1>
    <VCard :loading="loading">
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Type') }}</th>
            <th>{{ $gettext('Shipment') }}</th>
            <th>{{ $gettext('Issue Date') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id">
            <td>
              <VChip size="small" color="primary">{{ doc.typeLabel }}</VChip>
            </td>
            <td>
              <RouterLink :to="`/portal/shipments/${doc.shipmentId}`" class="text-decoration-none">
                {{ doc.shipmentCode }}
              </RouterLink>
            </td>
            <td>{{ doc.issueDate ?? '—' }}</td>
            <td>
              <VBtn
                size="x-small"
                variant="tonal"
                color="primary"
                :loading="downloading === doc.id"
                prepend-icon="tabler-download"
                @click="download(doc)"
              >
                {{ $gettext('Download') }}
              </VBtn>
            </td>
          </tr>
          <tr v-if="!documents.length && !loading">
            <td colspan="4" class="text-center text-medium-emphasis py-6">{{ $gettext('No documents available') }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
