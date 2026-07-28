<script setup>
// LcService removed - freight-specific service
const LcService = null;

const props = defineProps({ shipmentId: { type: Number, required: true } })

const lcs        = ref([])
const activeLc   = ref(null)
const loading    = ref(false)

// Dialogs
const lcDialog      = ref(false)
const docDialog     = ref(false)
const checkDialog   = ref(false)
const discDialog    = ref(false)
const presDialog    = ref(false)
const resolveDialog = ref(false)
const waiveDialog   = ref(false)

const saving = ref(false)
const checking = ref(false)

const editLcId   = ref(null)
const editDocId  = ref(null)
const editPresId = ref(null)
const resolveId  = ref(null)
const waiveId    = ref(null)

const LC_TYPES   = ['IRREVOCABLE', 'REVOLVING', 'STANDBY', 'TRANSFERABLE']
const LC_STATUSES = ['OPEN', 'DOCUMENTS_PREPARED', 'PRESENTED', 'NEGOTIATED', 'PAID', 'EXPIRED', 'CANCELLED']
const DOC_TYPES  = ['BL', 'INVOICE', 'PACKING_LIST', 'COO', 'INSURANCE', 'INSPECTION', 'OTHER']
const BANK_RESPONSES = ['COMPLIANT', 'DISCREPANT', 'PENDING']

const STATUS_COLOR = {
  OPEN: 'info', DOCUMENTS_PREPARED: 'warning', PRESENTED: 'primary',
  NEGOTIATED: 'success', PAID: 'success', EXPIRED: 'error', CANCELLED: 'default',
}
const SEVERITY_COLOR = { FATAL: 'error', WARNING: 'warning' }
const RESPONSE_COLOR = { COMPLIANT: 'success', DISCREPANT: 'error', PENDING: 'warning' }

const emptyLcForm = () => ({
  lcNumber: '', lcType: 'IRREVOCABLE',
  issuingBankName: '', advisingBankName: '', negotiatingBankName: '',
  applicantName: '', beneficiaryName: '',
  lcAmount: '', lcCurrency: 'USD',
  issueDate: '', expiryDate: '', expiryPlace: '', shipmentBy: '',
  presentationDays: 21, specialConditions: '',
  partialShipments: 'NOT_ALLOWED', transhipment: 'NOT_ALLOWED', status: 'OPEN',
})
const emptyDocForm = () => ({
  docType: 'BL', quantityOriginals: 1, quantityCopies: 0, specificWording: '',
})
const emptyCheckForm = () => ({
  blOnBoardDate: '', invoiceAmount: '', insuranceAmount: '', portNamesConsistent: true,
})
const emptyDiscForm = () => ({
  checkCode: 'MANUAL', severity: 'FATAL', description: '', documentType: null,
})
const emptyPresForm = () => ({
  presentedToBankName: '', presentedAt: new Date().toISOString().slice(0, 10),
  documentsPresented: [], hasDiscrepancies: false, bankResponse: null, notes: '',
})

const lcForm   = ref(emptyLcForm())
const docForm  = ref(emptyDocForm())
const checkForm = ref(emptyCheckForm())
const discForm  = ref(emptyDiscForm())
const presForm  = ref(emptyPresForm())
const resolveForm = ref({ resolution: '' })
const waiveForm   = ref({ waivedByBank: false, resolution: '' })

const checkResult = ref(null)

// Sub-resources for the active LC
const documents     = ref([])
const discrepancies = ref([])
const presentations = ref([])

const openDiscrepancies = computed(() =>
  discrepancies.value.filter(d => !d.isWaived && !d.resolvedAt)
)
const pendingDocs = computed(() =>
  documents.value.filter(d => !d.isReady).length
)

async function loadLcs() {
  loading.value = true
  lcs.value = await LcService.list({ shipmentId: props.shipmentId })
  loading.value = false
}

async function selectLc(lc) {
  activeLc.value = lc
  await Promise.all([loadDocuments(), loadDiscrepancies(), loadPresentations()])
}

async function loadDocuments()     { documents.value     = await LcService.listDocuments(activeLc.value.id) }
async function loadDiscrepancies() { discrepancies.value  = await LcService.listDiscrepancies(activeLc.value.id) }
async function loadPresentations() { presentations.value  = await LcService.listPresentations(activeLc.value.id) }

function openCreateLc() {
  editLcId.value = null
  lcForm.value   = emptyLcForm()
  lcDialog.value = true
}

function openEditLc(lc) {
  editLcId.value = lc.id
  lcForm.value   = {
    lcNumber: lc.lcNumber, lcType: lc.lcType,
    issuingBankName: lc.issuingBankName, advisingBankName: lc.advisingBankName ?? '',
    negotiatingBankName: lc.negotiatingBankName ?? '',
    applicantName: lc.applicantName, beneficiaryName: lc.beneficiaryName,
    lcAmount: lc.lcAmount, lcCurrency: lc.lcCurrency,
    issueDate: lc.issueDate, expiryDate: lc.expiryDate,
    expiryPlace: lc.expiryPlace, shipmentBy: lc.shipmentBy,
    presentationDays: lc.presentationDays,
    specialConditions: lc.specialConditions ?? '',
    partialShipments: lc.partialShipments, transhipment: lc.transhipment, status: lc.status,
  }
  lcDialog.value = true
}

async function saveLc() {
  saving.value = true
  try {
    const payload = { ...lcForm.value, shipmentId: props.shipmentId }
    if (editLcId.value) {
      await LcService.update(editLcId.value, payload)
    } else {
      await LcService.create(payload)
    }
    lcDialog.value = false
    await loadLcs()
  } finally {
    saving.value = false
  }
}

async function removeLc(id) {
  if (!confirm('Delete this Letter of Credit?')) return
  await LcService.remove(id)
  if (activeLc.value?.id === id) activeLc.value = null
  await loadLcs()
}

// Documents
function openCreateDoc() { editDocId.value = null; docForm.value = emptyDocForm(); docDialog.value = true }
function openEditDoc(d)  {
  editDocId.value = d.id
  docForm.value   = {
    docType: d.docType, quantityOriginals: d.quantityOriginals,
    quantityCopies: d.quantityCopies, specificWording: d.specificWording,
  }
  docDialog.value = true
}

async function saveDoc() {
  saving.value = true
  try {
    if (editDocId.value) {
      await LcService.updateDocument(activeLc.value.id, editDocId.value, docForm.value)
    } else {
      await LcService.createDocument(activeLc.value.id, docForm.value)
    }
    docDialog.value = false
    await loadDocuments()
  } finally {
    saving.value = false
  }
}

async function removeDoc(id) {
  if (!confirm('Remove this document requirement?')) return
  await LcService.deleteDocument(activeLc.value.id, id)
  await loadDocuments()
}

async function toggleReady(doc) {
  await LcService.markReady(activeLc.value.id, doc.id, { complianceChecked: doc.complianceChecked })
  await loadDocuments()
}

// Compliance check
async function runCheck() {
  checking.value = true
  checkResult.value = null
  try {
    const params = {}
    if (checkForm.value.blOnBoardDate)  params.blOnBoardDate  = checkForm.value.blOnBoardDate
    if (checkForm.value.invoiceAmount)  params.invoiceAmount  = parseFloat(checkForm.value.invoiceAmount)
    if (checkForm.value.insuranceAmount) params.insuranceAmount = parseFloat(checkForm.value.insuranceAmount)
    params.portNamesConsistent = checkForm.value.portNamesConsistent
    checkResult.value = await LcService.checkCompliance(activeLc.value.id, params)
    await loadDiscrepancies()
  } finally {
    checking.value = false
  }
}

// Discrepancies
function openCreateDisc() { discForm.value = emptyDiscForm(); discDialog.value = true }

async function saveDisc() {
  saving.value = true
  try {
    await LcService.createDiscrepancy(activeLc.value.id, discForm.value)
    discDialog.value = false
    await loadDiscrepancies()
  } finally {
    saving.value = false
  }
}

function openResolve(id) { resolveId.value = id; resolveForm.value = { resolution: '' }; resolveDialog.value = true }
async function submitResolve() {
  await LcService.resolveDiscrepancy(activeLc.value.id, resolveId.value, resolveForm.value)
  resolveDialog.value = false
  await loadDiscrepancies()
}

function openWaive(id) { waiveId.value = id; waiveForm.value = { waivedByBank: false, resolution: '' }; waiveDialog.value = true }
async function submitWaive() {
  await LcService.waiveDiscrepancy(activeLc.value.id, waiveId.value, waiveForm.value)
  waiveDialog.value = false
  await loadDiscrepancies()
}

// Presentations
function openCreatePres() { editPresId.value = null; presForm.value = emptyPresForm(); presDialog.value = true }

async function savePres() {
  saving.value = true
  try {
    const payload = {
      ...presForm.value,
      documentsPresented: presForm.value.documentsPresented ?? [],
    }
    if (editPresId.value) {
      await LcService.updatePresentation(activeLc.value.id, editPresId.value, payload)
    } else {
      await LcService.createPresentation(activeLc.value.id, payload)
    }
    presDialog.value = false
    await Promise.all([loadPresentations(), loadLcs()])
    // Refresh activeLc status
    const fresh = lcs.value.find(l => l.id === activeLc.value.id)
    if (fresh) activeLc.value = fresh
  } finally {
    saving.value = false
  }
}

function urgencyColor(days) {
  if (days === null || days === undefined) return 'default'
  if (days <= 3) return 'error'
  if (days <= 7) return 'warning'
  return 'success'
}

onMounted(loadLcs)
</script>

<template>
  <VContainer fluid class="pa-0">
    <!-- LC list header -->
    <VRow align="center" class="mb-3 px-4 pt-4">
      <VCol>
        <div class="text-subtitle-1 font-weight-bold">{{ $gettext('Letters of Credit') }}</div>
        <div class="text-caption text-disabled">LC terms, document checklist, compliance checker, presentations</div>
      </VCol>
      <VCol cols="auto">
        <VBtn size="small" color="primary" prepend-icon="tabler-plus" @click="openCreateLc">
          {{ $gettext('Add LC') }}
        </VBtn>
      </VCol>
    </VRow>

    <VDivider />

    <VRow class="ma-0">
      <!-- LC list sidebar -->
      <VCol cols="12" md="4" class="pa-0 border-e">
        <VList density="compact" :loading="loading">
          <VListItem
            v-for="lc in lcs" :key="lc.id"
            :active="activeLc?.id === lc.id"
            @click="selectLc(lc)"
            class="py-3"
          >
            <template #prepend>
              <VChip size="x-small" :color="STATUS_COLOR[lc.status] ?? 'default'" class="me-2">
                {{ lc.status }}
              </VChip>
            </template>
            <VListItemTitle class="text-body-2 font-weight-medium">{{ lc.lcNumber }}</VListItemTitle>
            <VListItemSubtitle class="text-caption">
              {{ lc.lcCurrency }} {{ Number(lc.lcAmount).toLocaleString() }}
            </VListItemSubtitle>
            <template #append>
              <div class="d-flex flex-column align-end gap-1">
                <VChip
                  v-if="lc.daysToShipmentBy !== null"
                  size="x-small" :color="urgencyColor(lc.daysToShipmentBy)"
                >
                  Ship: {{ lc.daysToShipmentBy >= 0 ? lc.daysToShipmentBy + 'd' : 'LATE' }}
                </VChip>
                <VChip
                  v-if="lc.daysToPresentation !== null"
                  size="x-small" :color="urgencyColor(lc.daysToPresentation)"
                >
                  Pres: {{ lc.daysToPresentation >= 0 ? lc.daysToPresentation + 'd' : 'LATE' }}
                </VChip>
              </div>
            </template>
          </VListItem>

          <VListItem v-if="!lcs.length && !loading">
            <VListItemTitle class="text-caption text-disabled text-center pa-4">
              {{ $gettext('No LCs on this shipment') }}
            </VListItemTitle>
          </VListItem>
        </VList>
      </VCol>

      <!-- LC detail panel -->
      <VCol cols="12" md="8" class="pa-0">
        <div v-if="!activeLc" class="d-flex align-center justify-center" style="height: 300px">
          <span class="text-caption text-disabled">{{ $gettext('Select an LC to view details') }}</span>
        </div>

        <div v-else>
          <!-- LC header bar -->
          <VRow align="center" class="pa-3 ma-0 bg-surface">
            <VCol>
              <div class="text-body-1 font-weight-bold">{{ activeLc.lcNumber }}</div>
              <div class="text-caption text-disabled">
                {{ activeLc.lcType }} · {{ activeLc.issuingBankName }}
              </div>
            </VCol>
            <VCol cols="auto" class="d-flex gap-1">
              <VBtn size="x-small" icon variant="text" @click="openEditLc(activeLc)">
                <VIcon>tabler-pencil</VIcon>
              </VBtn>
              <VBtn size="x-small" icon variant="text" color="error" @click="removeLc(activeLc.id)">
                <VIcon>tabler-trash</VIcon>
              </VBtn>
            </VCol>
          </VRow>

          <VDivider />

          <VTabs>
            <VTab value="details">{{ $gettext('Details') }}</VTab>
            <VTab value="documents">
              {{ $gettext('Documents') }}
              <VChip v-if="pendingDocs" size="x-small" color="warning" class="ms-1">{{ pendingDocs }}</VChip>
            </VTab>
            <VTab value="compliance">{{ $gettext('Compliance Check') }}</VTab>
            <VTab value="discrepancies">
              {{ $gettext('Discrepancies') }}
              <VChip v-if="openDiscrepancies.length" size="x-small" color="error" class="ms-1">
                {{ openDiscrepancies.length }}
              </VChip>
            </VTab>
            <VTab value="presentations">{{ $gettext('Presentations') }}</VTab>
          </VTabs>

          <VTabsWindow>
            <!-- Details tab -->
            <VTabsWindowItem value="details">
              <VTable density="compact" class="ma-3">
                <tbody>
                  <tr><td class="text-disabled text-caption w-33">{{ $gettext('LC Number') }}</td><td>{{ activeLc.lcNumber }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Type') }}</td><td>{{ activeLc.lcType }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Amount') }}</td><td class="font-weight-bold">{{ activeLc.lcCurrency }} {{ Number(activeLc.lcAmount).toLocaleString() }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Issuing Bank') }}</td><td>{{ activeLc.issuingBankName }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Advising Bank') }}</td><td>{{ activeLc.advisingBankName || '—' }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Negotiating Bank') }}</td><td>{{ activeLc.negotiatingBankName || '—' }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Applicant (Importer)') }}</td><td>{{ activeLc.applicantName }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Beneficiary (Exporter)') }}</td><td>{{ activeLc.beneficiaryName }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Issue Date') }}</td><td>{{ activeLc.issueDate }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Expiry Date') }}</td><td>{{ activeLc.expiryDate }} @ {{ activeLc.expiryPlace }}</td></tr>
                  <tr>
                    <td class="text-disabled text-caption">{{ $gettext('Shipment By') }}</td>
                    <td><span :class="activeLc.daysToShipmentBy < 7 ? 'text-error font-weight-bold' : ''">{{ activeLc.shipmentBy }}</span></td>
                  </tr>
                  <tr>
                    <td class="text-disabled text-caption">{{ $gettext('Presentation Deadline') }}</td>
                    <td>
                      <span v-if="activeLc.presentationDeadline" :class="activeLc.daysToPresentation < 5 ? 'text-error font-weight-bold' : ''">
                        {{ activeLc.presentationDeadline }} ({{ activeLc.presentationDays }} days after BL)
                      </span>
                      <span v-else class="text-disabled">{{ $gettext('Set BL date to calculate') }}</span>
                    </td>
                  </tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Partial Shipments') }}</td><td>{{ activeLc.partialShipments }}</td></tr>
                  <tr><td class="text-disabled text-caption">{{ $gettext('Transhipment') }}</td><td>{{ activeLc.transhipment }}</td></tr>
                  <tr v-if="activeLc.specialConditions">
                    <td class="text-disabled text-caption">{{ $gettext('Special Conditions') }}</td>
                    <td class="text-caption">{{ activeLc.specialConditions }}</td>
                  </tr>
                </tbody>
              </VTable>
            </VTabsWindowItem>

            <!-- Documents tab -->
            <VTabsWindowItem value="documents">
              <div class="d-flex justify-end pa-3">
                <VBtn size="small" color="primary" prepend-icon="tabler-plus" @click="openCreateDoc">
                  {{ $gettext('Add Requirement') }}
                </VBtn>
              </div>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th>{{ $gettext('Document') }}</th>
                    <th>{{ $gettext('Qty (Orig / Copy)') }}</th>
                    <th>{{ $gettext('Ready') }}</th>
                    <th>{{ $gettext('Checked') }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!documents.length">
                    <td colspan="5" class="text-center text-disabled pa-4 text-caption">{{ $gettext('No document requirements defined') }}</td>
                  </tr>
                  <tr v-for="doc in documents" :key="doc.id">
                    <td>
                      <VChip size="x-small" color="default" class="me-1">{{ doc.docType }}</VChip>
                      <span class="text-caption text-disabled">{{ doc.specificWording?.slice(0, 60) }}</span>
                    </td>
                    <td class="text-caption">{{ doc.quantityOriginals }} / {{ doc.quantityCopies }}</td>
                    <td>
                      <VChip
                        size="x-small" :color="doc.isReady ? 'success' : 'default'"
                        style="cursor: pointer"
                        @click="toggleReady(doc)"
                      >
                        {{ doc.isReady ? $gettext('Ready') : $gettext('Pending') }}
                      </VChip>
                    </td>
                    <td>
                      <VIcon v-if="doc.complianceChecked" color="success" size="16">tabler-circle-check</VIcon>
                      <VIcon v-else color="disabled" size="16">tabler-circle-dashed</VIcon>
                    </td>
                    <td>
                      <VBtn size="x-small" icon variant="text" @click="openEditDoc(doc)"><VIcon>tabler-pencil</VIcon></VBtn>
                      <VBtn size="x-small" icon variant="text" color="error" @click="removeDoc(doc.id)"><VIcon>tabler-trash</VIcon></VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VTabsWindowItem>

            <!-- Compliance check tab -->
            <VTabsWindowItem value="compliance" class="pa-4">
              <VAlert type="info" variant="tonal" class="mb-4" density="compact">
                {{ $gettext('Run this check before finalising the document set. FATAL issues will cause the bank to refuse payment.') }}
              </VAlert>

              <VRow dense>
                <VCol cols="12" md="4">
                  <VTextField v-model="checkForm.blOnBoardDate" type="date" :label="$gettext('BL On-Board Date')" density="compact" />
                </VCol>
                <VCol cols="12" md="4">
                  <VTextField v-model="checkForm.invoiceAmount" type="number" :label="$gettext('Invoice Amount')" density="compact" />
                </VCol>
                <VCol cols="12" md="4">
                  <VTextField v-model="checkForm.insuranceAmount" type="number" :label="$gettext('Insurance Amount')" density="compact" />
                </VCol>
                <VCol cols="12" md="4" class="d-flex align-center">
                  <VSwitch v-model="checkForm.portNamesConsistent" :label="$gettext('Port names consistent across all docs')" density="compact" hide-details />
                </VCol>
              </VRow>

              <VBtn color="warning" :loading="checking" class="mt-3" @click="runCheck">
                {{ $gettext('Run Compliance Check') }}
              </VBtn>

              <div v-if="checkResult" class="mt-4">
                <VAlert
                  :type="checkResult.status === 'PASS' ? 'success' : checkResult.status === 'WARNING' ? 'warning' : 'error'"
                  variant="tonal" class="mb-3"
                >
                  <strong>{{ checkResult.status }}</strong>
                  <span v-if="checkResult.discrepanciesCreated"> · {{ checkResult.discrepanciesCreated }} discrepancies logged</span>
                </VAlert>

                <VTable density="compact">
                  <thead><tr><th>Check</th><th>Severity</th><th>Result</th><th>Message</th></tr></thead>
                  <tbody>
                    <tr v-for="c in checkResult.checks" :key="c.code">
                      <td class="text-caption font-weight-medium">{{ c.code }}</td>
                      <td><VChip size="x-small" :color="SEVERITY_COLOR[c.severity]">{{ c.severity }}</VChip></td>
                      <td><VIcon :color="c.passed ? 'success' : 'error'">{{ c.passed ? 'tabler-circle-check' : 'tabler-circle-x' }}</VIcon></td>
                      <td class="text-caption">{{ c.message }}</td>
                    </tr>
                  </tbody>
                </VTable>
              </div>
            </VTabsWindowItem>

            <!-- Discrepancies tab -->
            <VTabsWindowItem value="discrepancies">
              <div class="d-flex justify-end pa-3">
                <VBtn size="small" color="warning" prepend-icon="tabler-plus" @click="openCreateDisc">
                  {{ $gettext('Log Manual Discrepancy') }}
                </VBtn>
              </div>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th>{{ $gettext('Code') }}</th>
                    <th>{{ $gettext('Severity') }}</th>
                    <th>{{ $gettext('Description') }}</th>
                    <th>{{ $gettext('Status') }}</th>
                    <th>{{ $gettext('Detected') }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!discrepancies.length">
                    <td colspan="6" class="text-center text-disabled pa-4 text-caption">{{ $gettext('No discrepancies') }}</td>
                  </tr>
                  <tr v-for="d in discrepancies" :key="d.id">
                    <td class="text-caption font-weight-medium">{{ d.checkCode }}</td>
                    <td><VChip size="x-small" :color="SEVERITY_COLOR[d.severity]">{{ d.severity }}</VChip></td>
                    <td class="text-caption">{{ d.description }}</td>
                    <td>
                      <VChip v-if="d.isWaived" size="x-small" color="default">Waived</VChip>
                      <VChip v-else-if="d.resolvedAt" size="x-small" color="success">Resolved</VChip>
                      <VChip v-else size="x-small" color="error">Open</VChip>
                    </td>
                    <td class="text-caption">{{ d.detectedAt.slice(0, 10) }}</td>
                    <td>
                      <template v-if="d.isOpen">
                        <VBtn size="x-small" variant="tonal" color="success" @click="openResolve(d.id)">{{ $gettext('Resolve') }}</VBtn>
                        <VBtn size="x-small" variant="tonal" color="default" class="ms-1" @click="openWaive(d.id)">{{ $gettext('Waive') }}</VBtn>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VTabsWindowItem>

            <!-- Presentations tab -->
            <VTabsWindowItem value="presentations">
              <div class="d-flex justify-end pa-3">
                <VBtn size="small" color="primary" prepend-icon="tabler-send" @click="openCreatePres">
                  {{ $gettext('Record Presentation') }}
                </VBtn>
              </div>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th>{{ $gettext('Presented To') }}</th>
                    <th>{{ $gettext('Date') }}</th>
                    <th>{{ $gettext('Documents') }}</th>
                    <th>{{ $gettext('Bank Response') }}</th>
                    <th>{{ $gettext('Payment') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!presentations.length">
                    <td colspan="5" class="text-center text-disabled pa-4 text-caption">{{ $gettext('No presentations recorded') }}</td>
                  </tr>
                  <tr v-for="p in presentations" :key="p.id">
                    <td class="text-caption">{{ p.presentedToBankName }}</td>
                    <td class="text-caption">{{ p.presentedAt.slice(0, 10) }}</td>
                    <td><span class="text-caption">{{ (p.documentsPresented ?? []).join(', ') || '—' }}</span></td>
                    <td>
                      <VChip v-if="p.bankResponse" size="x-small" :color="RESPONSE_COLOR[p.bankResponse]">
                        {{ p.bankResponse }}
                      </VChip>
                      <span v-else class="text-disabled text-caption">—</span>
                    </td>
                    <td class="text-caption">{{ p.paymentDate || '—' }}</td>
                  </tr>
                </tbody>
              </VTable>
            </VTabsWindowItem>
          </VTabsWindow>
        </div>
      </VCol>
    </VRow>

    <!-- LC Create/Edit Dialog -->
    <VDialog v-model="lcDialog" max-width="780px" persistent>
      <VCard :title="editLcId ? $gettext('Edit Letter of Credit') : $gettext('Add Letter of Credit')">
        <DialogCloseBtn @click="lcDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.lcNumber" :label="$gettext('LC Number')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="lcForm.lcType" :items="LC_TYPES" :label="$gettext('Type')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="lcForm.status" :items="LC_STATUSES" :label="$gettext('Status')" density="compact" />
            </VCol>
            <VCol cols="12" md="8">
              <VTextField v-model="lcForm.issuingBankName" :label="$gettext('Issuing Bank')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.lcCurrency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="lcForm.advisingBankName" :label="$gettext('Advising Bank (optional)')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="lcForm.negotiatingBankName" :label="$gettext('Negotiating Bank (optional)')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="lcForm.applicantName" :label="$gettext('Applicant (Importer)')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="lcForm.beneficiaryName" :label="$gettext('Beneficiary (Exporter)')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.lcAmount" type="number" :label="$gettext('LC Amount')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.issueDate" type="date" :label="$gettext('Issue Date')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.expiryDate" type="date" :label="$gettext('Expiry Date')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.expiryPlace" :label="$gettext('Expiry Place')" density="compact" placeholder="e.g. SINGAPORE" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="lcForm.shipmentBy" type="date" :label="$gettext('Shipment By Date')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="lcForm.presentationDays" type="number" :label="$gettext('Presentation Days')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="lcForm.partialShipments" :items="['ALLOWED','NOT_ALLOWED']" :label="$gettext('Partial Shipments')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="lcForm.transhipment" :items="['ALLOWED','NOT_ALLOWED']" :label="$gettext('Transhipment')" density="compact" />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="lcForm.specialConditions" :label="$gettext('Special Conditions')" density="compact" rows="3" clearable />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="lcDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="saveLc">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Document Requirement Dialog -->
    <VDialog v-model="docDialog" max-width="600px" persistent>
      <VCard :title="editDocId ? $gettext('Edit Document Requirement') : $gettext('Add Document Requirement')">
        <DialogCloseBtn @click="docDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="4">
              <VSelect v-model="docForm.docType" :items="DOC_TYPES" :label="$gettext('Document Type')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="docForm.quantityOriginals" type="number" :label="$gettext('Originals')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="docForm.quantityCopies" type="number" :label="$gettext('Copies')" density="compact" />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="docForm.specificWording"
                :label="$gettext('Required Wording (copy from LC)')"
                density="compact" rows="4"
                placeholder="e.g. Clean on board Bill of Lading marked FREIGHT PREPAID consigned to order of ISSUING BANK NAME"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="docDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="saveDoc">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Manual Discrepancy Dialog -->
    <VDialog v-model="discDialog" max-width="520px" persistent>
      <VCard :title="$gettext('Log Discrepancy')">
        <DialogCloseBtn @click="discDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="6">
              <VTextField v-model="discForm.checkCode" :label="$gettext('Check Code')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect v-model="discForm.severity" :items="['FATAL','WARNING']" :label="$gettext('Severity')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect v-model="discForm.documentType" :items="DOC_TYPES" :label="$gettext('Document')" density="compact" clearable />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="discForm.description" :label="$gettext('Description')" density="compact" rows="3" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="discDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="warning" :loading="saving" @click="saveDisc">{{ $gettext('Log') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Resolve Dialog -->
    <VDialog v-model="resolveDialog" max-width="440px">
      <VCard :title="$gettext('Resolve Discrepancy')">
        <VCardText>
          <VTextarea v-model="resolveForm.resolution" :label="$gettext('Resolution notes')" density="compact" rows="3" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="resolveDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="success" :disabled="!resolveForm.resolution" @click="submitResolve">{{ $gettext('Mark Resolved') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Waive Dialog -->
    <VDialog v-model="waiveDialog" max-width="440px">
      <VCard :title="$gettext('Waive Discrepancy')">
        <VCardText>
          <VSwitch v-model="waiveForm.waivedByBank" :label="$gettext('Waived by bank (applicant agreed)')" density="compact" hide-details class="mb-3" />
          <VTextarea v-model="waiveForm.resolution" :label="$gettext('Waiver notes')" density="compact" rows="2" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="waiveDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="default" :disabled="!waiveForm.resolution" @click="submitWaive">{{ $gettext('Confirm Waiver') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Presentation Dialog -->
    <VDialog v-model="presDialog" max-width="580px" persistent>
      <VCard :title="$gettext('Record Bank Presentation')">
        <DialogCloseBtn @click="presDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="8">
              <VTextField v-model="presForm.presentedToBankName" :label="$gettext('Bank Name')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="presForm.presentedAt" type="date" :label="$gettext('Presented Date')" density="compact" />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="presForm.documentsPresented"
                :items="DOC_TYPES"
                :label="$gettext('Documents Submitted')"
                density="compact" multiple chips closable-chips
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="presForm.bankResponse" :items="BANK_RESPONSES" :label="$gettext('Bank Response')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="6" class="d-flex align-center">
              <VSwitch v-model="presForm.hasDiscrepancies" :label="$gettext('Has Discrepancies')" density="compact" hide-details />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="presForm.notes" :label="$gettext('Notes')" density="compact" rows="2" clearable />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="presDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="savePres">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
