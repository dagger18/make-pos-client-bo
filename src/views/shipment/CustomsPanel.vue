<script setup>
import CustomsEntryService from '@/services/CustomsEntryService'

const props = defineProps({ shipmentId: { type: Number, required: true } })

const entries     = ref([])
const activeEntry = ref(null)
const loading     = ref(false)

const entryDialog = ref(false)
const lineDialog  = ref(false)
const editEntryId = ref(null)
const editLineId  = ref(null)
const saving      = ref(false)
const submitting  = ref(false)
const syncing     = ref(false)

const STATUS_COLOR = {
  DRAFT: 'default', SUBMITTED: 'info', ACKNOWLEDGED: 'primary',
  ASSESSMENT: 'warning', EXAMINATION: 'error', RELEASED: 'success', REJECTED: 'error',
}

const ENTRY_TYPES = ['IMPORT', 'EXPORT', 'TRANSIT', 'RE_EXPORT']
const ENTRY_MODES = ['FORMAL', 'INFORMAL', 'SIMPLIFIED', 'TIR']
const UOM_OPTIONS = ['KG', 'PCS', 'LITRE', 'M2', 'M3', 'SET']

const emptyEntryForm = () => ({
  entryType: 'IMPORT', entryMode: 'FORMAL', status: 'DRAFT',
  countryCode: '', systemCode: '', customsOffice: '',
  cifValue: '', valueCurrency: 'USD', notes: '',
})

const emptyLineForm = () => ({
  hsCode: '', description: '', countryOfOrigin: '',
  packages: null, netWeightKg: '', grossWeightKg: '',
  quantity: '', uom: 'KG', unitPrice: '', lineValue: '',
  valueCurrency: 'USD', dutyRate: '', dutyAmount: '',
  vatRate: '', vatAmount: '', isRestricted: false,
})

const entryForm = ref(emptyEntryForm())
const lineForm  = ref(emptyLineForm())

async function loadEntries() {
  loading.value = true
  try {
    entries.value = await CustomsEntryService.list(props.shipmentId)
  } finally {
    loading.value = false
  }
}

function selectEntry(entry) {
  activeEntry.value = entry
}

function openCreateEntry() {
  editEntryId.value = null
  entryForm.value   = emptyEntryForm()
  entryDialog.value = true
}

function openEditEntry(entry) {
  editEntryId.value = entry.id
  entryForm.value   = {
    entryType: entry.entryType, entryMode: entry.entryMode, status: entry.status,
    countryCode: entry.countryCode ?? '', systemCode: entry.systemCode ?? '',
    customsOffice: entry.customsOffice ?? '', cifValue: entry.cifValue ?? '',
    valueCurrency: entry.valueCurrency ?? 'USD', notes: entry.notes ?? '',
  }
  entryDialog.value = true
}

async function saveEntry() {
  saving.value = true
  try {
    let result
    if (editEntryId.value) {
      result = await CustomsEntryService.update(props.shipmentId, editEntryId.value, entryForm.value)
    } else {
      result = await CustomsEntryService.create(props.shipmentId, entryForm.value)
    }
    entryDialog.value = false
    await loadEntries()
    const targetId = editEntryId.value ?? result?.id
    if (targetId) {
      const fresh = entries.value.find(e => e.id === targetId)
      if (fresh) activeEntry.value = fresh
    }
  } finally {
    saving.value = false
  }
}

async function removeEntry(id) {
  if (!confirm($gettext('Delete this customs entry?'))) return
  await CustomsEntryService.remove(props.shipmentId, id)
  if (activeEntry.value?.id === id) activeEntry.value = null
  await loadEntries()
}

async function submitEntry(entry) {
  submitting.value = true
  try {
    const result = await CustomsEntryService.submit(props.shipmentId, entry.id)
    if (result) activeEntry.value = result
    await loadEntries()
    const fresh = entries.value.find(e => e.id === entry.id)
    if (fresh) activeEntry.value = fresh
  } finally {
    submitting.value = false
  }
}

async function syncEntry(entry) {
  syncing.value = true
  try {
    const result = await CustomsEntryService.syncStatus(props.shipmentId, entry.id)
    if (result) activeEntry.value = result
    await loadEntries()
    const fresh = entries.value.find(e => e.id === entry.id)
    if (fresh) activeEntry.value = fresh
  } finally {
    syncing.value = false
  }
}

function openAddLine() {
  editLineId.value = null
  lineForm.value   = emptyLineForm()
  lineDialog.value = true
}

function openEditLine(line) {
  editLineId.value = line.id
  lineForm.value   = {
    hsCode: line.hsCode ?? '', description: line.description ?? '',
    countryOfOrigin: line.countryOfOrigin ?? '', packages: line.packages ?? null,
    netWeightKg: line.netWeightKg ?? '', grossWeightKg: line.grossWeightKg ?? '',
    quantity: line.quantity ?? '', uom: line.uom ?? 'KG',
    unitPrice: line.unitPrice ?? '', lineValue: line.lineValue ?? '',
    valueCurrency: line.valueCurrency ?? 'USD', dutyRate: line.dutyRate ?? '',
    dutyAmount: line.dutyAmount ?? '', vatRate: line.vatRate ?? '',
    vatAmount: line.vatAmount ?? '', isRestricted: line.isRestricted ?? false,
  }
  lineDialog.value = true
}

async function saveLine() {
  saving.value = true
  try {
    if (editLineId.value) {
      await CustomsEntryService.updateLine(props.shipmentId, activeEntry.value.id, editLineId.value, lineForm.value)
    } else {
      await CustomsEntryService.addLine(props.shipmentId, activeEntry.value.id, lineForm.value)
    }
    lineDialog.value = false
    await loadEntries()
    const fresh = entries.value.find(e => e.id === activeEntry.value.id)
    if (fresh) activeEntry.value = fresh
  } finally {
    saving.value = false
  }
}

async function removeLine(lineId) {
  if (!confirm($gettext('Remove this commodity line?'))) return
  await CustomsEntryService.removeLine(props.shipmentId, activeEntry.value.id, lineId)
  await loadEntries()
  const fresh = entries.value.find(e => e.id === activeEntry.value.id)
  if (fresh) activeEntry.value = fresh
}

onMounted(loadEntries)
</script>

<template>
  <VContainer fluid class="pa-0">
    <!-- Header -->
    <VRow align="center" class="mb-3 px-4 pt-4">
      <VCol>
        <div class="text-subtitle-1 font-weight-bold">{{ $gettext('Customs Entries') }}</div>
        <div class="text-caption text-disabled">{{ $gettext('Declare, submit, and track customs clearance status') }}</div>
      </VCol>
      <VCol cols="auto">
        <VBtn size="small" color="primary" prepend-icon="tabler-plus" @click="openCreateEntry">
          {{ $gettext('Add Entry') }}
        </VBtn>
      </VCol>
    </VRow>

    <VDivider />

    <VRow class="ma-0">
      <!-- Entry list sidebar -->
      <VCol cols="12" md="4" class="pa-0 border-e">
        <VList density="compact" :loading="loading">
          <VListItem
            v-for="entry in entries" :key="entry.id"
            :active="activeEntry?.id === entry.id"
            class="py-3"
            @click="selectEntry(entry)"
          >
            <template #prepend>
              <VChip size="x-small" :color="STATUS_COLOR[entry.status] ?? 'default'" class="me-2">
                {{ entry.status }}
              </VChip>
            </template>
            <VListItemTitle class="text-body-2 font-weight-medium">
              {{ entry.declarationNumber || $gettext('(no declaration)') }}
            </VListItemTitle>
            <VListItemSubtitle class="text-caption">
              <VChip size="x-small" color="default" class="me-1">{{ entry.entryType }}</VChip>
              {{ entry.countryCode }}
            </VListItemSubtitle>
          </VListItem>

          <VListItem v-if="!entries.length && !loading">
            <VListItemTitle class="text-caption text-disabled text-center pa-4">
              {{ $gettext('No customs entries on this shipment') }}
            </VListItemTitle>
          </VListItem>
        </VList>
      </VCol>

      <!-- Entry detail panel -->
      <VCol cols="12" md="8" class="pa-0">
        <div v-if="!activeEntry" class="d-flex align-center justify-center" style="height: 300px">
          <span class="text-caption text-disabled">{{ $gettext('Select an entry to view details') }}</span>
        </div>

        <div v-else>
          <!-- Entry header bar -->
          <VRow align="center" class="pa-3 ma-0 bg-surface">
            <VCol>
              <div class="d-flex align-center gap-2">
                <span class="text-body-1 font-weight-bold">{{ activeEntry.entryType }}</span>
                <VChip size="x-small" :color="STATUS_COLOR[activeEntry.status] ?? 'default'">
                  {{ activeEntry.status }}
                </VChip>
              </div>
              <div class="text-caption text-disabled">
                {{ activeEntry.entryMode }} · {{ activeEntry.customsOffice || '—' }}
              </div>
            </VCol>
            <VCol cols="auto" class="d-flex gap-1 flex-wrap">
              <VBtn size="x-small" variant="tonal" @click="openEditEntry(activeEntry)">
                <VIcon start>tabler-pencil</VIcon>{{ $gettext('Edit') }}
              </VBtn>
              <VBtn
                v-if="['DRAFT', 'REJECTED'].includes(activeEntry.status)"
                size="x-small" variant="tonal" color="info"
                :loading="submitting"
                @click="submitEntry(activeEntry)"
              >
                <VIcon start>tabler-send</VIcon>{{ $gettext('Submit') }}
              </VBtn>
              <VBtn
                v-if="activeEntry.declarationNumber"
                size="x-small" variant="tonal" color="warning"
                :loading="syncing"
                @click="syncEntry(activeEntry)"
              >
                <VIcon start>tabler-refresh</VIcon>{{ $gettext('Sync') }}
              </VBtn>
              <VBtn
                v-if="activeEntry.status === 'DRAFT'"
                size="x-small" variant="tonal" color="error"
                @click="removeEntry(activeEntry.id)"
              >
                <VIcon start>tabler-trash</VIcon>{{ $gettext('Delete') }}
              </VBtn>
            </VCol>
          </VRow>

          <VDivider />

          <!-- Entry info table -->
          <VTable density="compact" class="ma-3">
            <tbody>
              <tr>
                <td class="text-disabled text-caption w-33">{{ $gettext('Entry Type') }}</td>
                <td>{{ activeEntry.entryType }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Entry Mode') }}</td>
                <td>{{ activeEntry.entryMode }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Declaration No.') }}</td>
                <td>{{ activeEntry.declarationNumber || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Entry Number') }}</td>
                <td>{{ activeEntry.entryNumber || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Country') }}</td>
                <td>{{ activeEntry.countryCode || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Customs Office') }}</td>
                <td>{{ activeEntry.customsOffice || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('System Code') }}</td>
                <td>{{ activeEntry.systemCode || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('CIF Value') }}</td>
                <td>{{ activeEntry.valueCurrency }} {{ activeEntry.cifValue ? Number(activeEntry.cifValue).toLocaleString() : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Total Duty') }}</td>
                <td>{{ activeEntry.totalDuty ? Number(activeEntry.totalDuty).toLocaleString() : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Total VAT') }}</td>
                <td>{{ activeEntry.totalVat ? Number(activeEntry.totalVat).toLocaleString() : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Total Tax') }}</td>
                <td>{{ activeEntry.totalTax ? Number(activeEntry.totalTax).toLocaleString() : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Submission Ref') }}</td>
                <td>{{ activeEntry.submissionRef || '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Submitted At') }}</td>
                <td>{{ activeEntry.submittedAt ? activeEntry.submittedAt.slice(0, 10) : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Acknowledged At') }}</td>
                <td>{{ activeEntry.acknowledgedAt ? activeEntry.acknowledgedAt.slice(0, 10) : '—' }}</td>
              </tr>
              <tr>
                <td class="text-disabled text-caption">{{ $gettext('Released At') }}</td>
                <td>{{ activeEntry.releasedAt ? activeEntry.releasedAt.slice(0, 10) : '—' }}</td>
              </tr>
              <tr v-if="activeEntry.notes">
                <td class="text-disabled text-caption">{{ $gettext('Notes') }}</td>
                <td class="text-caption">{{ activeEntry.notes }}</td>
              </tr>
            </tbody>
          </VTable>

          <VDivider />

          <!-- Commodity Lines -->
          <VRow align="center" class="px-4 py-2 ma-0">
            <VCol>
              <div class="text-body-2 font-weight-bold">{{ $gettext('Commodity Lines') }}</div>
            </VCol>
            <VCol cols="auto">
              <VBtn size="x-small" color="primary" prepend-icon="tabler-plus" @click="openAddLine">
                {{ $gettext('Add Line') }}
              </VBtn>
            </VCol>
          </VRow>

          <VTable density="compact">
            <thead>
              <tr>
                <th>{{ $gettext('Line#') }}</th>
                <th>{{ $gettext('HS Code') }}</th>
                <th>{{ $gettext('Description') }}</th>
                <th>{{ $gettext('Country') }}</th>
                <th>{{ $gettext('Pkgs') }}</th>
                <th>{{ $gettext('Net Wt') }}</th>
                <th>{{ $gettext('Qty / UOM') }}</th>
                <th>{{ $gettext('Unit Price') }}</th>
                <th>{{ $gettext('Duty %') }}</th>
                <th>{{ $gettext('Duty Amt') }}</th>
                <th>{{ $gettext('VAT %') }}</th>
                <th>{{ $gettext('VAT Amt') }}</th>
                <th>{{ $gettext('Restr.') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!activeEntry.lines?.length">
                <td colspan="14" class="text-center text-disabled pa-4 text-caption">
                  {{ $gettext('No commodity lines defined') }}
                </td>
              </tr>
              <tr v-for="line in activeEntry.lines" :key="line.id">
                <td class="text-caption">{{ line.lineNumber }}</td>
                <td class="text-caption font-weight-medium">{{ line.hsCode }}</td>
                <td class="text-caption">{{ line.description }}</td>
                <td class="text-caption">{{ line.countryOfOrigin }}</td>
                <td class="text-caption">{{ line.packages ?? '—' }}</td>
                <td class="text-caption">{{ line.netWeightKg ? Number(line.netWeightKg).toLocaleString() : '—' }}</td>
                <td class="text-caption">{{ line.quantity != null ? line.quantity : '—' }} {{ line.uom }}</td>
                <td class="text-caption">{{ line.unitPrice ? Number(line.unitPrice).toLocaleString() : '—' }}</td>
                <td class="text-caption">{{ line.dutyRate ? Number(line.dutyRate).toLocaleString() : '—' }}</td>
                <td class="text-caption">{{ line.dutyAmount ? Number(line.dutyAmount).toLocaleString() : '—' }}</td>
                <td class="text-caption">{{ line.vatRate ? Number(line.vatRate).toLocaleString() : '—' }}</td>
                <td class="text-caption">{{ line.vatAmount ? Number(line.vatAmount).toLocaleString() : '—' }}</td>
                <td>
                  <VIcon v-if="line.isRestricted" color="error" size="16">tabler-alert-triangle</VIcon>
                  <VIcon v-else color="disabled" size="16">tabler-circle-dashed</VIcon>
                </td>
                <td>
                  <VBtn size="x-small" icon variant="text" @click="openEditLine(line)">
                    <VIcon>tabler-pencil</VIcon>
                  </VBtn>
                  <VBtn size="x-small" icon variant="text" color="error" @click="removeLine(line.id)">
                    <VIcon>tabler-trash</VIcon>
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>
      </VCol>
    </VRow>

    <!-- Entry Create/Edit Dialog -->
    <VDialog v-model="entryDialog" max-width="680px" persistent>
      <VCard :title="editEntryId ? $gettext('Edit Customs Entry') : $gettext('Add Customs Entry')">
        <DialogCloseBtn @click="entryDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="4">
              <VSelect v-model="entryForm.entryType" :items="ENTRY_TYPES" :label="$gettext('Entry Type')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="entryForm.entryMode" :items="ENTRY_MODES" :label="$gettext('Entry Mode')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="entryForm.status" :items="Object.keys(STATUS_COLOR)" :label="$gettext('Status')" density="compact" />
            </VCol>
            <VCol cols="12" md="2">
              <VTextField v-model="entryForm.countryCode" :label="$gettext('Country Code')" density="compact" maxlength="2" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="entryForm.systemCode" :label="$gettext('System Code')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="entryForm.customsOffice" :label="$gettext('Customs Office')" density="compact" />
            </VCol>
            <VCol cols="12" md="5">
              <VTextField v-model="entryForm.cifValue" type="number" :label="$gettext('CIF Value')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="entryForm.valueCurrency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="entryForm.notes" :label="$gettext('Notes')" density="compact" rows="2" clearable />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="entryDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="saveEntry">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Line Add/Edit Dialog -->
    <VDialog v-model="lineDialog" max-width="720px" persistent>
      <VCard :title="editLineId ? $gettext('Edit Commodity Line') : $gettext('Add Commodity Line')">
        <DialogCloseBtn @click="lineDialog = false" />
        <VCardText>
          <VRow dense>
            <!-- Row 1: HS Code, Description, Country of Origin -->
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.hsCode" :label="$gettext('HS Code')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="lineForm.description" :label="$gettext('Description')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.countryOfOrigin" :label="$gettext('Country of Origin')" density="compact" maxlength="2" />
            </VCol>

            <!-- Row 2: Packages, Net Weight, Gross Weight, Quantity, UOM -->
            <VCol cols="12" md="2">
              <VTextField v-model="lineForm.packages" type="number" :label="$gettext('Packages')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.netWeightKg" type="number" :label="$gettext('Net Weight (kg)')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.grossWeightKg" type="number" :label="$gettext('Gross Weight (kg)')" density="compact" />
            </VCol>
            <VCol cols="12" md="2">
              <VTextField v-model="lineForm.quantity" type="number" :label="$gettext('Quantity')" density="compact" />
            </VCol>
            <VCol cols="12" md="2">
              <VSelect v-model="lineForm.uom" :items="UOM_OPTIONS" :label="$gettext('UOM')" density="compact" />
            </VCol>

            <!-- Row 3: Unit Price, Line Value, Currency -->
            <VCol cols="12" md="4">
              <VTextField v-model="lineForm.unitPrice" type="number" :label="$gettext('Unit Price')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lineForm.lineValue" type="number" :label="$gettext('Line Value')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lineForm.valueCurrency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>

            <!-- Row 4: Duty Rate, Duty Amount, VAT Rate, VAT Amount -->
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.dutyRate" type="number" :label="$gettext('Duty Rate (%)')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.dutyAmount" type="number" :label="$gettext('Duty Amount')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.vatRate" type="number" :label="$gettext('VAT Rate (%)')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="lineForm.vatAmount" type="number" :label="$gettext('VAT Amount')" density="compact" />
            </VCol>

            <!-- Row 5: Restricted -->
            <VCol cols="12">
              <VSwitch v-model="lineForm.isRestricted" :label="$gettext('Restricted Goods')" density="compact" hide-details />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="lineDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="saveLine">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
