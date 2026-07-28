<script setup>
import { filterConfigs, headers } from '@/config/tables/Consolidation'
import ConsolidationService from '@/services/ConsolidationService'
import { can } from '@layouts/plugins/casl'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Consolidation' } })

const router = useRouter()
const { $gettext } = useGettext()

const table = ref(null)
const showCreate = ref(false)
const createForm = ref({ transportMode: 'SEA', serviceType: 'FCL', branchId: null })
const branches = ref([])

const MODES = [
  { value: 'SEA', label: 'Sea' },
  { value: 'AIR', label: 'Air' },
  { value: 'ROAD', label: 'Road' },
]
const SERVICE_TYPES = ['FCL', 'LCL', 'FTL', 'LTL', 'CHARTER', 'GROUPAGE']

const statusColor = (s) =>
  ({ OPEN: 'primary', CLOSED: 'success', DEPARTED: 'info', ARRIVED: 'warning', CANCELLED: 'error' }[s] ?? 'default')
const modeIcon = (m) =>
  ({ SEA: 'tabler-ship', AIR: 'tabler-plane', ROAD: 'tabler-truck' }[m] ?? 'tabler-package')

const buttons = computed(() =>
  can('POST', 'Shipment')
    ? [{ text: $gettext('New Consolidation'), func: () => { showCreate.value = true } }]
    : []
)

async function loadBranches() {
  const res = await $api('branch')
  branches.value = res?.data ?? res ?? []
}

async function submitCreate() {
  const result = await ConsolidationService.create(createForm.value)
  showCreate.value = false
  router.push({ name: 'consolidation-id', params: { id: result.id } })
}

onMounted(loadBranches)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="ConsolidationService"
    :pageTitle="$gettext('Consolidations')"
  >
    <template #mode="{ item }">
      <VIcon :icon="modeIcon(item.transportMode)" size="14" class="me-1" />
      {{ item.transportMode }} · {{ item.serviceType }}
    </template>

    <template #status="{ item }">
      <VChip :color="statusColor(item.status)" size="small" label>{{ item.status }}</VChip>
    </template>

    <template #jobs="{ item }">
      <VChip size="small" variant="tonal">{{ item.childCount }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn
        size="x-small"
        icon
        variant="text"
        @click="router.push({ name: 'consolidation-id', params: { id: item.id } })"
      >
        <VIcon icon="tabler-chevron-right" size="16" />
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="showCreate" max-width="480">
    <VCard :title="$gettext('New Consolidation')">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="createForm.transportMode"
              :items="MODES"
              item-value="value"
              item-title="label"
              :label="$gettext('Transport Mode') + ' *'"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="createForm.serviceType"
              :items="SERVICE_TYPES"
              :label="$gettext('Service Type') + ' *'"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="createForm.branchId"
              :items="branches"
              item-value="id"
              item-title="name"
              :label="$gettext('Branch') + ' *'"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="showCreate = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :disabled="!createForm.branchId" @click="submitCreate">
          {{ $gettext('Create') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
