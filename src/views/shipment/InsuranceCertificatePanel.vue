<script setup>
import InsuranceService from '@/services/InsuranceService'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const certs       = ref([])
const policies    = ref([])
const loading     = ref(false)
const saving      = ref(false)
const dialog      = ref(false)
const claimDialog = ref(false)
const cancelDialog = ref(false)
const selectedCert = ref(null)

const emptyForm = () => ({
  id: null,
  policyId: null,
  insuredName: '',
  beneficiaryName: '',
  goodsDescription: '',
  packing: '',
  vesselOrFlight: '',
  voyageOrFlightNo: '',
  polName: props.shipment.polName ?? '',
  podName: props.shipment.podName ?? '',
  etd: '',
  cargoValue: 0,
  valueCurrency: 'USD',
  coverageScope: 'ALL_RISK',
  issueDate: new Date().toISOString().slice(0, 10),
  // computed from premium calculation
  insuredAmount: 0,
  premiumAmount: 0,
  premiumCurrency: 'USD',
})
const form = ref(emptyForm())

const emptyClaimForm = () => ({
  certificateId: null,
  shipmentId: props.shipment.id,
  claimType: 'DAMAGE',
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentLocation: '',
  description: '',
  claimedAmount: 0,
  currency: 'USD',
  status: 'FILED',
})
const claimForm = ref(emptyClaimForm())

const CLAIM_TYPES = ['TOTAL_LOSS', 'PARTIAL_LOSS', 'DAMAGE', 'THEFT', 'DELAY']
const COVERAGE_SCOPES = ['ALL_RISK', 'NAMED_PERILS', 'TOTAL_LOSS_ONLY']

const STATUS_COLOR = {
  ISSUED: 'success',
  CANCELLED: 'error',
  CLAIMED: 'warning',
}

const policyItems = computed(() =>
  policies.value.map(p => ({
    value: p.id,
    title: `${p.policyNumber} — ${p.policyType} (${p.coverageScope})`,
    currency: p.currency,
  }))
)

watch(() => form.value.policyId, async (pid) => {
  if (!pid || !form.value.cargoValue) return
  const result = await InsuranceService.calculatePremium(pid, form.value.cargoValue)
  if (result) {
    form.value.insuredAmount   = result.insuredAmount
    form.value.premiumAmount   = result.premiumAmount
    form.value.premiumCurrency = result.currency
  }
})

watch(() => form.value.cargoValue, async (val) => {
  if (!form.value.policyId || !val) return
  const result = await InsuranceService.calculatePremium(form.value.policyId, val)
  if (result) {
    form.value.insuredAmount   = result.insuredAmount
    form.value.premiumAmount   = result.premiumAmount
    form.value.premiumCurrency = result.currency
  }
})

async function load() {
  loading.value = true
  certs.value = await InsuranceService.listCertificates(props.shipment.id)
  loading.value = false
}

async function loadPolicies() {
  policies.value = await InsuranceService.listPolicies(true)
}

function openCreate() {
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(cert) {
  form.value = {
    id: cert.id,
    policyId: cert.policy?.id ?? null,
    insuredName: cert.insuredName,
    beneficiaryName: cert.beneficiaryName ?? '',
    goodsDescription: cert.goodsDescription,
    packing: cert.packing ?? '',
    vesselOrFlight: cert.vesselOrFlight ?? '',
    voyageOrFlightNo: cert.voyageOrFlightNo ?? '',
    polName: cert.polName,
    podName: cert.podName,
    etd: cert.etd ?? '',
    cargoValue: cert.cargoValue,
    valueCurrency: cert.valueCurrency,
    insuredAmount: cert.insuredAmount,
    premiumAmount: cert.premiumAmount,
    premiumCurrency: cert.premiumCurrency,
    coverageScope: cert.coverageScope,
    issueDate: cert.issueDate,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  const payload = {
    shipmentId:       props.shipment.id,
    policyId:         form.value.policyId,
    insuredName:      form.value.insuredName,
    beneficiaryName:  form.value.beneficiaryName || null,
    goodsDescription: form.value.goodsDescription,
    packing:          form.value.packing || null,
    vesselOrFlight:   form.value.vesselOrFlight || null,
    voyageOrFlightNo: form.value.voyageOrFlightNo || null,
    polName:          form.value.polName,
    podName:          form.value.podName,
    etd:              form.value.etd || null,
    cargoValue:       form.value.cargoValue,
    valueCurrency:    form.value.valueCurrency,
    insuredAmount:    form.value.insuredAmount,
    premiumAmount:    form.value.premiumAmount,
    premiumCurrency:  form.value.premiumCurrency,
    coverageScope:    form.value.coverageScope,
    issueDate:        form.value.issueDate,
  }
  try {
    if (form.value.id) {
      await InsuranceService.updateCertificate(form.value.id, payload)
    } else {
      await InsuranceService.createCertificate(payload)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

function openCancelDialog(cert) {
  selectedCert.value = cert
  cancelDialog.value = true
}

async function confirmCancel() {
  saving.value = true
  try {
    await InsuranceService.cancelCertificate(selectedCert.value.id)
    cancelDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  await InsuranceService.deleteCertificate(id)
  await load()
}

function openFileClaim(cert) {
  claimForm.value = {
    ...emptyClaimForm(),
    certificateId: cert.id,
    currency: cert.premiumCurrency,
  }
  claimDialog.value = true
}

async function saveClaim() {
  saving.value = true
  try {
    await InsuranceService.createClaim(claimForm.value)
    claimDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const fmt = (v) =>
  Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(() => {
  load()
  loadPolicies()
})
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-3">
      <VBtn size="small" prepend-icon="tabler-plus" @click="openCreate">
        {{ $gettext('Issue Certificate') }}
      </VBtn>
    </div>

    <div v-if="loading" class="text-center py-8">
      <VProgressCircular indeterminate :size="32" />
    </div>

    <div v-else-if="certs.length === 0" class="text-center py-8 text-disabled">
      {{ $gettext('No insurance certificates for this shipment.') }}
    </div>

    <VTable v-else density="compact" class="text-sm">
      <thead>
        <tr>
          <th>{{ $gettext('Certificate #') }}</th>
          <th>{{ $gettext('Policy') }}</th>
          <th>{{ $gettext('Insured') }}</th>
          <th class="text-right">{{ $gettext('Cargo Value') }}</th>
          <th class="text-right">{{ $gettext('Insured Amount') }}</th>
          <th class="text-right">{{ $gettext('Premium') }}</th>
          <th>{{ $gettext('Issue Date') }}</th>
          <th>{{ $gettext('Status') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in certs" :key="c.id">
          <td class="font-weight-medium">{{ c.certificateNumber }}</td>
          <td class="text-caption">{{ c.policy?.policyNumber }}</td>
          <td>{{ c.insuredName }}</td>
          <td class="text-right text-no-wrap">{{ fmt(c.cargoValue) }} {{ c.valueCurrency }}</td>
          <td class="text-right text-no-wrap">{{ fmt(c.insuredAmount) }} {{ c.valueCurrency }}</td>
          <td class="text-right text-no-wrap font-weight-medium">
            {{ fmt(c.premiumAmount) }} {{ c.premiumCurrency }}
          </td>
          <td>{{ c.issueDate }}</td>
          <td>
            <VChip size="x-small" :color="STATUS_COLOR[c.status] ?? 'default'">{{ c.status }}</VChip>
          </td>
          <td class="text-right text-no-wrap">
            <VBtn
              v-if="c.status === 'ISSUED'"
              size="x-small" variant="text" icon="tabler-pencil"
              @click="openEdit(c)"
            />
            <VBtn
              v-if="c.status === 'ISSUED'"
              size="x-small" variant="text" icon="tabler-file-alert" color="warning"
              @click="openFileClaim(c)"
            >
              <VIcon icon="tabler-file-alert" />
              <VTooltip activator="parent">{{ $gettext('File Claim') }}</VTooltip>
            </VBtn>
            <VBtn
              v-if="c.status === 'ISSUED'"
              size="x-small" variant="text" icon="tabler-x" color="error"
              @click="openCancelDialog(c)"
            >
              <VIcon icon="tabler-x" />
              <VTooltip activator="parent">{{ $gettext('Cancel Certificate') }}</VTooltip>
            </VBtn>
            <VBtn
              size="x-small" variant="text" icon="tabler-trash" color="error"
              @click="remove(c.id)"
            />
          </td>
        </tr>
      </tbody>
    </VTable>

    <!-- Issue / Edit Dialog -->
    <VDialog v-model="dialog" max-width="680px" persistent>
      <VCard :title="form.id ? $gettext('Edit Certificate') : $gettext('Issue Insurance Certificate')">
        <DialogCloseBtn @click="dialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12">
              <VSelect
                v-model="form.policyId"
                :items="policyItems"
                :label="$gettext('Insurance Policy')"
                item-title="title"
                item-value="value"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.insuredName" :label="$gettext('Insured Name')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.beneficiaryName" :label="$gettext('Beneficiary Name')" density="compact" clearable />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="form.goodsDescription" :label="$gettext('Goods Description')" density="compact" rows="2" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.packing" :label="$gettext('Packing')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.vesselOrFlight" :label="$gettext('Vessel / Flight')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.polName" :label="$gettext('Port of Loading')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.podName" :label="$gettext('Port of Discharge')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.etd" type="date" :label="$gettext('ETD')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="form.cargoValue" type="number" :label="$gettext('Cargo Value (CIF)')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.valueCurrency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="form.coverageScope" :items="COVERAGE_SCOPES" :label="$gettext('Coverage')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                :model-value="form.insuredAmount"
                :label="$gettext('Insured Amount (auto)')"
                density="compact"
                readonly
                :hint="$gettext('= Cargo Value × 1.10')"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                :model-value="form.premiumAmount"
                :label="$gettext('Premium (auto)')"
                density="compact"
                readonly
                :hint="$gettext('Calculated from policy rate')"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.issueDate" type="date" :label="$gettext('Issue Date')" density="compact" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Cancel Certificate Dialog -->
    <VDialog v-model="cancelDialog" max-width="400px">
      <VCard>
        <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">
          {{ $gettext('Cancel Certificate') }}
        </VCardTitle>
        <VCardText>
          <p>{{ $gettext('Are you sure you want to cancel certificate') }} <strong>{{ selectedCert?.certificateNumber }}</strong>?</p>
          <p class="text-caption text-medium-emphasis mt-2">
            {{ $gettext('This action cannot be undone. A cancelled certificate cannot be used for claims.') }}
          </p>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="cancelDialog = false">{{ $gettext('Back') }}</VBtn>
          <VBtn color="error" :loading="saving" @click="confirmCancel">{{ $gettext('Cancel Certificate') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- File Claim Dialog -->
    <VDialog v-model="claimDialog" max-width="560px" persistent>
      <VCard :title="$gettext('File Insurance Claim')">
        <DialogCloseBtn @click="claimDialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="6">
              <VSelect
                v-model="claimForm.claimType"
                :items="CLAIM_TYPES"
                :label="$gettext('Claim Type')"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="claimForm.incidentDate" type="date" :label="$gettext('Incident Date')" density="compact" />
            </VCol>
            <VCol cols="12">
              <VTextField v-model="claimForm.incidentLocation" :label="$gettext('Incident Location')" density="compact" clearable />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="claimForm.description" :label="$gettext('Description')" density="compact" rows="3" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model.number="claimForm.claimedAmount" type="number" :label="$gettext('Claimed Amount')" density="compact" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="claimForm.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="claimDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="warning" :loading="saving" @click="saveClaim">{{ $gettext('File Claim') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
