<script setup>
import DdService from '@/services/DdService'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const records      = ref([])
const ftaList      = ref([])
const loading      = ref(false)
const saving       = ref(false)
const dialog       = ref(false)
const returnDialog = ref(false)
const disputeDialog = ref(false)
const selectedId   = ref(null)
const returnDate   = ref('')
const disputeReason = ref('')

const emptyForm = () => ({
  id:                   null,
  containerNumber:      '',
  ddType:               'DETENTION',
  freeTimeAgreementId:  null,
  freeStartDate:        '',
  freeDays:             14,
  currency:             'USD',
})
const form = ref(emptyForm())

const ddTypeOptions = [
  { title: 'Detention', value: 'DETENTION' },
  { title: 'Demurrage', value: 'DEMURRAGE' },
  { title: 'Combined', value: 'COMBINED' },
]

const ftaItems = computed(() =>
  ftaList.value.map(f => ({
    value: f.id,
    title: [
      f.carrier?.name ?? '?',
      f.freeType,
      `${f.freeDays}d`,
      f.currency,
      f.port ? f.port.code : $gettext('All ports'),
      f.direction,
      f.containerType ?? '',
    ].filter(Boolean).join(' · '),
    freeDays: f.freeDays,
    currency: f.currency,
  }))
)

watch(() => form.value.freeTimeAgreementId, (ftaId) => {
  if (!ftaId) return
  const fta = ftaItems.value.find(f => f.value === ftaId)
  if (fta) {
    form.value.freeDays = fta.freeDays
    form.value.currency = fta.currency
  }
})

const freeEndDate = computed(() => {
  if (!form.value.freeStartDate || !form.value.freeDays) return ''
  const d = new Date(form.value.freeStartDate)
  d.setDate(d.getDate() + Number(form.value.freeDays) - 1)
  return d.toISOString().slice(0, 10)
})

async function load() {
  loading.value = true
  records.value = await DdService.listByShipment(props.shipment.id)
  loading.value = false
}

async function loadFta() {
  const list = await DdService.listFta()
  ftaList.value = list ?? []
}

function openCreate() {
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(record) {
  form.value = {
    id:                  record.id,
    containerNumber:     record.containerNumber,
    ddType:              record.ddType,
    freeTimeAgreementId: record.freeTimeAgreement?.id ?? null,
    freeStartDate:       record.freeStartDate ?? '',
    freeDays:            record.freeDays,
    currency:            record.currency,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  const payload = {
    containerNumber:     form.value.containerNumber,
    ddType:              form.value.ddType,
    freeTimeAgreementId: form.value.freeTimeAgreementId ?? null,
    freeStartDate:       form.value.freeStartDate,
    freeDays:            form.value.freeDays,
    freeEndDate:         freeEndDate.value,
    currency:            form.value.currency,
  }
  try {
    if (form.value.id) {
      await DdService.update(form.value.id, payload)
    } else {
      await DdService.create(props.shipment.id, payload)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  await DdService.deleteTracking(id)
  await load()
}

function openReturn(id) {
  selectedId.value = id
  returnDate.value = new Date().toISOString().slice(0, 10)
  returnDialog.value = true
}

function openDispute(id) {
  selectedId.value = id
  disputeReason.value = ''
  disputeDialog.value = true
}

async function confirmReturn() {
  saving.value = true
  try {
    await DdService.recordReturn(selectedId.value, returnDate.value)
    returnDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function confirmDispute() {
  saving.value = true
  try {
    await DdService.dispute(selectedId.value, disputeReason.value)
    disputeDialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const fmt = (v) =>
  Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(() => {
  load()
  loadFta()
})
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-3">
      <VBtn size="small" prepend-icon="tabler-plus" @click="openCreate">
        {{ $gettext('Add D&D Record') }}
      </VBtn>
    </div>

    <div v-if="loading" class="text-center py-8">
      <VProgressCircular indeterminate :size="32" />
    </div>

    <div v-else-if="records.length === 0" class="text-center py-8 text-disabled">
      {{ $gettext('No D&D tracking records for this shipment.') }}
    </div>

    <VTable v-else density="compact" class="text-sm">
      <thead>
        <tr>
          <th>{{ $gettext('Container') }}</th>
          <th>{{ $gettext('Type') }}</th>
          <th>{{ $gettext('Free Period') }}</th>
          <th class="text-right">{{ $gettext('Free Days') }}</th>
          <th class="text-right">{{ $gettext('Chargeable') }}</th>
          <th class="text-right">{{ $gettext('Accrued') }}</th>
          <th class="text-right">{{ $gettext('Last Accrual') }}</th>
          <th>{{ $gettext('Status') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in records" :key="r.id">
          <td class="font-weight-medium">{{ r.containerNumber }}</td>
          <td>
            <VChip size="x-small" :color="r.ddType === 'DETENTION' ? 'info' : r.ddType === 'DEMURRAGE' ? 'warning' : 'secondary'">
              {{ r.ddType }}
            </VChip>
          </td>
          <td class="text-no-wrap">
            {{ r.freeStartDate ?? '—' }}
            <span class="text-disabled mx-1">→</span>
            {{ r.freeEndDate ?? '—' }}
          </td>
          <td class="text-right">{{ r.freeDays }}</td>
          <td class="text-right" :class="(r.chargeableDays ?? 0) > 0 ? 'text-error font-weight-bold' : ''">
            {{ r.chargeableDays ?? 0 }}
          </td>
          <td class="text-right text-no-wrap" :class="parseFloat(r.accruedAmount) > 0 ? 'text-error font-weight-bold' : ''">
            {{ fmt(r.accruedAmount) }} {{ r.currency }}
          </td>
          <td class="text-right text-disabled">{{ r.lastAccrualDate ?? '—' }}</td>
          <td>
            <div class="d-flex gap-1 flex-wrap">
              <VChip v-if="r.isFinal" size="x-small" color="success">{{ $gettext('Final') }}</VChip>
              <VChip v-if="r.isDisputed" size="x-small" color="warning">{{ $gettext('Disputed') }}</VChip>
            </div>
          </td>
          <td class="text-right text-no-wrap">
            <VBtn
              v-if="!r.isFinal"
              size="x-small" variant="text" icon="tabler-pencil"
              @click="openEdit(r)"
            />
            <VBtn
              v-if="!r.isFinal"
              size="x-small" variant="text" icon="tabler-checkbox" color="success"
              @click="openReturn(r.id)"
            >
              <VIcon icon="tabler-checkbox" />
              <VTooltip activator="parent">{{ $gettext('Record Return') }}</VTooltip>
            </VBtn>
            <VBtn
              v-if="!r.isDisputed"
              size="x-small" variant="text" icon="tabler-alert-triangle" color="warning"
              @click="openDispute(r.id)"
            >
              <VIcon icon="tabler-alert-triangle" />
              <VTooltip activator="parent">{{ $gettext('Mark Disputed') }}</VTooltip>
            </VBtn>
            <VBtn
              size="x-small" variant="text" icon="tabler-trash" color="error"
              @click="remove(r.id)"
            />
          </td>
        </tr>
      </tbody>
    </VTable>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="560px" persistent>
      <VCard :title="form.id ? $gettext('Edit D&D Record') : $gettext('Add D&D Record')">
        <DialogCloseBtn @click="dialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.containerNumber"
                :label="$gettext('Container Number')"
                density="compact"
                placeholder="XXXX1234567"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.ddType"
                :label="$gettext('D&D Type')"
                :items="ddTypeOptions"
                item-title="title"
                item-value="value"
                density="compact"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="form.freeTimeAgreementId"
                :label="$gettext('Free Time Agreement')"
                :items="ftaItems"
                item-title="title"
                item-value="value"
                density="compact"
                clearable
                :hint="$gettext('Selecting an FTA auto-fills free days and currency')"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.freeStartDate"
                :label="$gettext('Free Start Date')"
                type="date"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.freeDays"
                :label="$gettext('Free Days')"
                type="number"
                min="1"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                :model-value="freeEndDate"
                :label="$gettext('Free End Date (computed)')"
                type="date"
                density="compact"
                readonly
                :hint="$gettext('= start date + free days − 1')"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.currency"
                :label="$gettext('Currency')"
                density="compact"
                maxlength="3"
                style="text-transform: uppercase"
              />
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

    <!-- Return Dialog -->
    <VDialog v-model="returnDialog" max-width="400px">
      <VCard>
        <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">
          {{ $gettext('Record Container Return') }}
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="returnDate"
            :label="$gettext('Return Date')"
            type="date"
            density="compact"
          />
          <p class="text-caption text-medium-emphasis mt-2">
            {{ $gettext('This finalises the D&D record and calculates the final chargeable amount.') }}
          </p>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="returnDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="success" :loading="saving" @click="confirmReturn">
            {{ $gettext('Confirm Return') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dispute Dialog -->
    <VDialog v-model="disputeDialog" max-width="400px">
      <VCard>
        <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">
          {{ $gettext('Mark as Disputed') }}
        </VCardTitle>
        <VCardText>
          <VTextarea
            v-model="disputeReason"
            :label="$gettext('Dispute Reason')"
            density="compact"
            rows="3"
            :placeholder="$gettext('e.g. Container returned on time but not recorded correctly')"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="disputeDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="warning" :loading="saving" @click="confirmDispute">
            {{ $gettext('Confirm') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
