<script setup>
import { filterConfigs, headers } from '@/config/tables/RateImport'
import ProviderService from '@/services/ProviderService'
import RateImportService from '@/services/RateImportService'
import RateImportDetail from '@/views/rate/RateImportDetail.vue'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE_Import', subject: 'Rate' } })

const { $gettext } = useGettext()

const table       = ref(null)
const uploadOpen  = ref(false)
const uploading   = ref(false)
const detailOpen  = ref(false)
const selectedJob = ref(null)
const providers   = ref([])
const fileInput   = ref(null)

const transportTypes = [
  { value: 'OCN', title: 'Ocean (OCN)' },
  { value: 'AIR', title: 'Air (AIR)' },
  { value: 'RD',  title: 'Road (RD)' },
  { value: 'RAL', title: 'Rail (RAL)' },
  { value: 'COU', title: 'Courier (COU)' },
]

const statusColor = {
  PENDING: 'default', PARSING: 'info', VALIDATING: 'info', PREVIEW: 'warning',
  APPROVED: 'info', IMPORTING: 'info', COMPLETED: 'success', FAILED: 'error', ROLLED_BACK: 'default',
}

const uploadForm = ref(emptyUploadForm())
function emptyUploadForm() {
  return { file: null, fileName: '', transportType: 'OCN', effectiveDate: '', expiryDate: '', currency: 'USD', providerId: null }
}

function onFileChange(e) {
  const f = e.target.files[0] ?? null
  uploadForm.value.file = f
  uploadForm.value.fileName = f?.name ?? ''
}

function openUpload() {
  uploadForm.value = emptyUploadForm()
  uploadOpen.value = true
}

const buttons = computed(() => [{ text: $gettext('New Import'), func: openUpload }])

async function submitUpload() {
  if (!uploadForm.value.file || !uploadForm.value.effectiveDate || !uploadForm.value.expiryDate) return
  uploading.value = true
  const job = await RateImportService.upload(uploadForm.value)
  uploading.value = false
  if (job?.id) {
    uploadOpen.value = false
    await table.value?.fetchData()
    await openDetail(job)
  }
}

async function openDetail(job) {
  selectedJob.value = await RateImportService.get(job.id)
  detailOpen.value = true
}

async function onJobUpdated() {
  await table.value?.fetchData()
  if (selectedJob.value) {
    selectedJob.value = await RateImportService.get(selectedJob.value.id)
  }
}

onMounted(async () => {
  const res = await ProviderService.list('limit=-1')
  providers.value = res?.list ?? res?.data ?? res ?? []
})
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="RateImportService"
    :pageTitle="$gettext('Rate Import')"
  >
    <template #status="{ item }">
      <VChip :color="statusColor[item.status] ?? 'default'" size="x-small" label>
        {{ item.status }}
      </VChip>
    </template>

    <template #fileName="{ item }">
      <span class="text-caption text-truncate" style="max-width:200px; display:block">
        {{ item.fileName ?? '—' }}
      </span>
    </template>

    <template #rows="{ item }">
      <span class="text-caption">
        <span class="text-success">{{ item.rowsImported }}</span>
        /
        <span>{{ item.totalRows }}</span>
        <span v-if="item.rowsErrored" class="text-error ms-1">({{ item.rowsErrored }} err)</span>
      </span>
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openDetail(item)">
        <VIcon icon="tabler-eye" size="16" />
      </VBtn>
    </template>
  </AppTable>

  <!-- Upload Dialog -->
  <VDialog v-model="uploadOpen" max-width="560">
    <VCard :title="$gettext('Upload Rate File')">
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VSelect
              v-model="uploadForm.transportType"
              :items="transportTypes"
              item-title="title"
              item-value="value"
              :label="$gettext('Transport Mode')"
              density="compact"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="uploadForm.providerId"
              :items="providers"
              item-title="name"
              item-value="id"
              :label="$gettext('Provider / Carrier (optional)')"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="uploadForm.effectiveDate" :label="$gettext('Effective Date')" type="date" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="uploadForm.expiryDate" :label="$gettext('Expiry Date')" type="date" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="uploadForm.currency" :label="$gettext('Currency')" placeholder="USD" density="compact" />
          </VCol>
          <VCol cols="12">
            <div
              class="upload-drop-area"
              :class="{ 'has-file': uploadForm.file }"
              @click="fileInput.click()"
            >
              <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="d-none" @change="onFileChange" />
              <VIcon :icon="uploadForm.file ? 'tabler-file-spreadsheet' : 'tabler-file-upload'" size="28" class="me-2" />
              <span v-if="uploadForm.file" class="text-body-2">{{ uploadForm.fileName }}</span>
              <span v-else class="text-body-2 text-disabled">{{ $gettext('Click to select .xlsx / .xls / .csv') }}</span>
            </div>
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="uploadOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn
          color="primary"
          :loading="uploading"
          :disabled="!uploadForm.file || !uploadForm.effectiveDate || !uploadForm.expiryDate"
          @click="submitUpload"
        >
          {{ $gettext('Upload & Preview') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <RateImportDetail
    v-model="detailOpen"
    :job="selectedJob"
    @updated="onJobUpdated"
  />
</template>

<style scoped>
.upload-drop-area {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: border-color 0.2s;
}
.upload-drop-area:hover,
.upload-drop-area.has-file {
  border-color: rgb(var(--v-theme-primary));
}
</style>
