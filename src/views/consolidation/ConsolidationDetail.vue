<script setup>
import ConsolidationService from '@/services/ConsolidationService'
import ShipmentService from '@/services/ShipmentService'
import StuffingPanel from './StuffingPanel.vue'
import StrippingPanel from './StrippingPanel.vue'
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

const route = useRoute()
const router = useRouter()
const consol = ref(null)
const loading = ref(false)
const activeTab = ref('header')
const saving = ref(false)
const addShipmentDialog = ref(false)
const addShipmentCode = ref('')
const addShipmentSearching = ref(false)
const addShipmentResults = ref([])
const confirmClose = ref(false)
const confirmDepart = ref(false)
const confirmArrive = ref(false)
const confirmCancel = ref(false)
const ports = ref([])
const carriers = ref([])

const id = computed(() => route.params.id)
const isEditable = computed(() => consol.value?.status === 'OPEN')
const statusColor = (s) => ({ OPEN: 'primary', CLOSED: 'success', DEPARTED: 'info', ARRIVED: 'warning', CANCELLED: 'error' }[s] ?? 'default')
const modeIcon = (m) => ({ SEA: 'tabler-ship', AIR: 'tabler-plane', ROAD: 'tabler-truck' }[m] ?? 'tabler-package')

const form = ref({})
function initForm(c) {
  form.value = {
    carrierId:          c.carrier?.id ?? null,
    polId:              c.pol?.id ?? null,
    podId:              c.pod?.id ?? null,
    vessel:             c.vessel ?? '',
    voyage:             c.voyage ?? '',
    mblNumber:          c.mblNumber ?? '',
    flightNumber:       c.flightNumber ?? '',
    mawbNumber:         c.mawbNumber ?? '',
    containerNumber:    c.containerNumber ?? '',
    uldNumber:          c.uldNumber ?? '',
    etd:                c.etd ?? '',
    eta:                c.eta ?? '',
    apportionmentBasis: c.apportionmentBasis ?? 'WEIGHT',
    cfsCutoff:          c.cfsCutoff ? c.cfsCutoff.substring(0, 16) : '',
    docCutoff:          c.docCutoff ? c.docCutoff.substring(0, 16) : '',
    maxWeightKg:        c.maxWeightKg ?? '',
    maxVolumeCbm:       c.maxVolumeCbm ?? '',
  }
}

async function load() {
  loading.value = true
  consol.value = await ConsolidationService.get(id.value)
  initForm(consol.value)
  loading.value = false
}

async function loadRefData() {
  const [portRes, clientRes] = await Promise.all([
    $api('port?limit=500'),
    $api('client?type=carrier&limit=500'),
  ])
  ports.value = portRes?.data ?? portRes ?? []
  carriers.value = clientRes?.data ?? clientRes ?? []
}

async function save() {
  saving.value = true
  consol.value = await ConsolidationService.update(id.value, form.value)
  initForm(consol.value)
  saving.value = false
}

async function doClose() {
  consol.value = await ConsolidationService.close(id.value)
  confirmClose.value = false
}

async function doDepart() {
  consol.value = await ConsolidationService.depart(id.value)
  confirmDepart.value = false
}

async function doArrive() {
  consol.value = await ConsolidationService.arrive(id.value)
  confirmArrive.value = false
}

async function doCancel() {
  await ConsolidationService.cancel(id.value)
  confirmCancel.value = false
  router.push({ name: 'consolidation' })
}

async function searchShipment() {
  if (!addShipmentCode.value.trim()) return
  addShipmentSearching.value = true
  const res = await ShipmentService.list(`code=${addShipmentCode.value.trim()}`)
  addShipmentResults.value = res?.data ?? res ?? []
  addShipmentSearching.value = false
}

async function attachShipment(shipmentId) {
  await ConsolidationService.addShipment(id.value, shipmentId)
  addShipmentDialog.value = false
  addShipmentCode.value = ''
  addShipmentResults.value = []
  await load()
}

async function detachShipment(shipId) {
  await ConsolidationService.removeShipment(id.value, shipId)
  await load()
}

function downloadManifest(language) {
  window.open(ConsolidationService.downloadManifestPdf(id.value, language), '_blank')
}

onMounted(() => {
  load()
  loadRefData()
})
</script>

<template>
  <VContainer fluid v-if="consol">
    <!-- Header bar -->
    <VRow align="center" class="mb-4">
      <VCol>
        <div class="d-flex align-center gap-3">
          <VBtn icon variant="text" @click="$router.push({ name: 'consolidation' })">
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <VIcon :icon="modeIcon(consol.transportMode)" size="20" />
          <h4 class="text-h5 font-weight-bold mb-0">{{ consol.code }}</h4>
          <VChip :color="statusColor(consol.status)" label size="small">{{ consol.statusLabel ?? consol.status }}</VChip>
        </div>
        <div class="text-caption text-medium-emphasis ms-12">
          {{ consol.transportMode }} · {{ consol.serviceType }} · {{ consol.branch?.name }}
        </div>
      </VCol>
      <VCol cols="auto" class="d-flex gap-2 flex-wrap">
        <VBtn v-if="consol.status === 'OPEN'" color="success" variant="tonal" prepend-icon="tabler-lock" @click="confirmClose = true">
          {{ $gettext('Close Consol') }}
        </VBtn>
        <VBtn v-if="consol.status === 'CLOSED'" color="info" variant="tonal" prepend-icon="tabler-plane-departure" @click="confirmDepart = true">
          {{ $gettext('Mark Departed') }}
        </VBtn>
        <VBtn v-if="consol.status === 'DEPARTED'" color="warning" variant="tonal" prepend-icon="tabler-plane-arrival" @click="confirmArrive = true">
          {{ $gettext('Mark Arrived') }}
        </VBtn>
        <VBtn v-if="!['CANCELLED', 'ARRIVED'].includes(consol.status)" color="error" variant="text" prepend-icon="tabler-trash" @click="confirmCancel = true">
          {{ $gettext('Cancel') }}
        </VBtn>
      </VCol>
    </VRow>

    <!-- Tabs -->
    <VTabs v-model="activeTab" class="mb-4">
      <VTab value="header"><VIcon icon="tabler-info-circle" size="16" class="me-1" />{{ $gettext('Header') }}</VTab>
      <VTab value="manifest"><VIcon icon="tabler-list" size="16" class="me-1" />{{ $gettext('Manifest') }} <VChip size="x-small" class="ms-1">{{ consol.childCount ?? consol.children?.length ?? 0 }}</VChip></VTab>
      <VTab value="stuffing"><VIcon icon="tabler-stack-push" size="16" class="me-1" />{{ $gettext('Stuffing') }}</VTab>
      <VTab value="stripping"><VIcon icon="tabler-stack-pop" size="16" class="me-1" />{{ $gettext('Stripping') }}</VTab>
    </VTabs>

    <VWindow v-model="activeTab">
      <!-- Header tab -->
      <VWindowItem value="header">
        <VCard>
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VAutocomplete v-model="form.polId" :items="ports" item-value="id" item-title="name" :label="$gettext('POL (Port of Loading)')" clearable :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="6">
                <VAutocomplete v-model="form.podId" :items="ports" item-value="id" item-title="name" :label="$gettext('POD (Port of Discharge)')" clearable :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="6">
                <VAutocomplete v-model="form.carrierId" :items="carriers" item-value="id" item-title="name" :label="$gettext('Carrier')" clearable :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="form.etd" type="date" :label="$gettext('ETD')" :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="form.eta" type="date" :label="$gettext('ETA')" :disabled="!isEditable" />
              </VCol>

              <!-- Sea fields -->
              <template v-if="consol.transportMode === 'SEA'">
                <VCol cols="12" md="6">
                  <VTextField v-model="form.vessel" :label="$gettext('Vessel')" :disabled="!isEditable" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="form.voyage" :label="$gettext('Voyage')" :disabled="!isEditable" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="form.mblNumber" :label="$gettext('MBL Number')" :disabled="!isEditable" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="form.containerNumber" :label="$gettext('Container Number')" :disabled="!isEditable" />
                </VCol>
              </template>

              <!-- Air fields -->
              <template v-if="consol.transportMode === 'AIR'">
                <VCol cols="12" md="6">
                  <VTextField v-model="form.flightNumber" :label="$gettext('Flight Number')" :disabled="!isEditable" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="form.mawbNumber" :label="$gettext('MAWB Number')" :disabled="!isEditable" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="form.uldNumber" :label="$gettext('ULD Number')" :disabled="!isEditable" />
                </VCol>
              </template>

              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.apportionmentBasis"
                  :items="['WEIGHT', 'VOLUME', 'REVENUE_WEIGHT', 'UNITS']"
                  :label="$gettext('Apportionment Basis')"
                  :disabled="!isEditable"
                />
              </VCol>

              <!-- Cutoff dates -->
              <VCol cols="12" md="3">
                <VTextField v-model="form.cfsCutoff" type="datetime-local" :label="$gettext('CFS Cutoff')" :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="form.docCutoff" type="datetime-local" :label="$gettext('Doc Cutoff')" :disabled="!isEditable" />
              </VCol>

              <!-- Capacity -->
              <VCol cols="12" md="3">
                <VTextField v-model="form.maxWeightKg" type="number" :label="$gettext('Max Weight (kg)')" :disabled="!isEditable" />
              </VCol>
              <VCol cols="12" md="3">
                <VTextField v-model="form.maxVolumeCbm" type="number" :label="$gettext('Max Volume (CBM)')" :disabled="!isEditable" />
              </VCol>
            </VRow>
          </VCardText>
          <VCardActions v-if="isEditable" class="justify-end">
            <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save Changes') }}</VBtn>
          </VCardActions>
        </VCard>
      </VWindowItem>

      <!-- Stuffing tab -->
      <VWindowItem value="stuffing">
        <StuffingPanel :consol-id="consol.id" :editable="isEditable" />
      </VWindowItem>

      <!-- Stripping tab -->
      <VWindowItem value="stripping">
        <StrippingPanel :consol-id="consol.id" :editable="isEditable" />
      </VWindowItem>

      <!-- Manifest tab -->
      <VWindowItem value="manifest">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between pa-4">
            <span>{{ $gettext('Child Shipments') }}</span>
            <div class="d-flex gap-2">
              <VMenu v-if="consol.children?.length">
                <template #activator="{ props }">
                  <VBtn v-bind="props" variant="tonal" color="secondary" size="small" prepend-icon="tabler-file-type-pdf">
                    {{ $gettext('Manifest PDF') }}
                    <VIcon icon="tabler-chevron-down" size="14" class="ms-1" />
                  </VBtn>
                </template>
                <VList density="compact">
                  <VListItem :title="$gettext('English')" @click="downloadManifest('en')" />
                  <VListItem :title="$gettext('Vietnamese')" @click="downloadManifest('vi')" />
                </VList>
              </VMenu>
              <VBtn v-if="isEditable" color="primary" size="small" prepend-icon="tabler-plus" @click="addShipmentDialog = true">
                {{ $gettext('Add Shipment') }}
              </VBtn>
            </div>
          </VCardTitle>
          <VTable>
            <thead>
              <tr>
                <th>{{ $gettext('Job Code') }}</th>
                <th>{{ $gettext('Status') }}</th>
                <th>{{ $gettext('Client') }}</th>
                <th v-if="isEditable"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!consol.children?.length">
                <td :colspan="isEditable ? 4 : 3" class="text-center text-medium-emphasis pa-4">
                  {{ $gettext('No shipments in this consolidation yet.') }}
                </td>
              </tr>
              <tr
                v-for="child in consol.children"
                :key="child.id"
                class="cursor-pointer"
                @click="$router.push({ name: 'shipment-id-tab1-tab2', params: { id: child.id, tab1: 'overview', tab2: 'detail' } })"
              >
                <td><span class="font-weight-medium">{{ child.code }}</span></td>
                <td><VChip size="small" label>{{ child.status }}</VChip></td>
                <td>{{ child.client ?? '—' }}</td>
                <td v-if="isEditable">
                  <VBtn icon variant="text" size="small" color="error" @click.stop="detachShipment(child.id)">
                    <VIcon icon="tabler-x" size="16" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VWindowItem>
    </VWindow>
  </VContainer>

  <VContainer v-else-if="loading" class="d-flex justify-center pa-8">
    <VProgressCircular indeterminate />
  </VContainer>

  <!-- Add Shipment Dialog -->
  <VDialog v-model="addShipmentDialog" max-width="500">
    <VCard :title="$gettext('Add Shipment to Consolidation')">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="addShipmentCode"
              :label="$gettext('Search by Job Code')"
              placeholder="e.g. OEX-2025-001"
              append-inner-icon="tabler-search"
              @click:append-inner="searchShipment"
              @keyup.enter="searchShipment"
            />
          </VCol>
        </VRow>
        <VList v-if="addShipmentResults.length">
          <VListItem
            v-for="s in addShipmentResults"
            :key="s.id"
            :title="s.code"
            :subtitle="s.status"
            @click="attachShipment(s.id)"
            class="cursor-pointer"
          />
        </VList>
        <div v-else-if="addShipmentSearching" class="text-center pa-4">
          <VProgressCircular indeterminate size="24" />
        </div>
        <div v-else-if="addShipmentCode" class="text-center text-medium-emphasis pa-2">{{ $gettext('No results.') }}</div>
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="addShipmentDialog = false">{{ $gettext('Close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Close confirmation -->
  <VDialog v-model="confirmClose" max-width="400">
    <VCard :title="$gettext('Close Consolidation?')">
      <VCardText>{{ $gettext('This will write the MBL/MAWB number to all child shipments and lock the consolidation.') }}</VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="confirmClose = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="success" @click="doClose">{{ $gettext('Confirm Close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Depart confirmation -->
  <VDialog v-model="confirmDepart" max-width="400">
    <VCard :title="$gettext('Mark as Departed?')">
      <VCardText>{{ $gettext('This will set the consolidation status to DEPARTED and automatically record a departure milestone on all child shipments.') }}</VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="confirmDepart = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="info" @click="doDepart">{{ $gettext('Confirm Departed') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Arrive confirmation -->
  <VDialog v-model="confirmArrive" max-width="400">
    <VCard :title="$gettext('Mark as Arrived?')">
      <VCardText>{{ $gettext('This will set the consolidation status to ARRIVED and automatically record an arrival milestone on all child shipments.') }}</VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="confirmArrive = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="warning" @click="doArrive">{{ $gettext('Confirm Arrived') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Cancel confirmation -->
  <VDialog v-model="confirmCancel" max-width="400">
    <VCard :title="$gettext('Cancel Consolidation?')">
      <VCardText>{{ $gettext('This action cannot be undone. All child shipments must be removed first.') }}</VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="confirmCancel = false">{{ $gettext('Back') }}</VBtn>
        <VBtn color="error" @click="doCancel">{{ $gettext('Cancel Consolidation') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
