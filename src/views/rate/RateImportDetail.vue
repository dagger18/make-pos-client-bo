<script setup>
// RateImportService removed - freight-specific service
const RateImportService = null;

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  job: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const approving  = ref(false)
const rollingBack = ref(false)

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const statusColor = {
  PENDING:    'default',
  PARSING:    'info',
  VALIDATING: 'info',
  PREVIEW:    'warning',
  APPROVED:   'info',
  IMPORTING:  'info',
  COMPLETED:  'success',
  FAILED:     'error',
  ROLLED_BACK:'default',
}

const actionColor = {
  NEW:    'success',
  UPDATE: 'info',
  SKIP:   'default',
  ERROR:  'error',
}

const rowHeaders = [
  { title: '#',           key: 'rowNumber',         width: 55 },
  { title: 'Action',      key: 'action',            width: 90 },
  { title: 'POL',         key: 'polCode',           width: 80 },
  { title: 'POD',         key: 'podCode',           width: 80 },
  { title: 'Container',   key: 'containerType',     width: 100 },
  { title: 'Charge',      key: 'chargeCode',        width: 100 },
  { title: 'New Buy',     key: 'newBuyingAmount',   width: 90, align: 'end' },
  { title: 'New Sell',    key: 'newSellingAmount',  width: 90, align: 'end' },
  { title: 'Curr. Buy',   key: 'currentBuyingAmount',width: 90, align: 'end' },
  { title: 'Δ %',         key: 'changePct',         width: 80, align: 'end' },
  { title: '⚑',           key: 'isSanityFlagged',   width: 50 },
  { title: 'Error',       key: 'errorMessage' },
]

function formatPct(val) {
  if (val === null || val === undefined) return '—'
  const n = parseFloat(val)
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
}

function pctColor(val) {
  if (!val) return ''
  const n = parseFloat(val)
  if (n > 20) return 'text-error'
  if (n < -20) return 'text-warning'
  return ''
}

async function approve() {
  approving.value = true
  await RateImportService.approve(props.job.id)
  approving.value = false
  emit('updated')
}

async function rollback() {
  rollingBack.value = true
  await RateImportService.rollback(props.job.id)
  rollingBack.value = false
  emit('updated')
}
</script>

<template>
  <VDialog v-model="open" max-width="1300" scrollable>
    <VCard v-if="job">
      <!-- Header -->
      <VCardTitle class="d-flex align-center gap-2 px-4 pt-4 pb-2 flex-wrap">
        <VIcon icon="tabler-file-import" size="20" />
        {{ $gettext('Rate Import') }} #{{ job.id }}
        <VChip :color="statusColor[job.status] ?? 'default'" size="small" label class="ms-1">
          {{ job.status }}
        </VChip>
        <VSpacer />

        <!-- Approve -->
        <VBtn
          v-if="job.status === 'PREVIEW'"
          color="success"
          variant="elevated"
          :loading="approving"
          @click="approve"
        >
          <VIcon start icon="tabler-check" size="16" />{{ $gettext('Approve & Import') }}
        </VBtn>

        <!-- Rollback -->
        <VBtn
          v-if="job.status === 'COMPLETED' && job.canRollback"
          color="warning"
          variant="outlined"
          :loading="rollingBack"
          @click="rollback"
        >
          <VIcon start icon="tabler-arrow-back-up" size="16" />{{ $gettext('Rollback') }}
        </VBtn>

        <VBtn icon variant="text" @click="open = false">
          <VIcon icon="tabler-x" size="20" />
        </VBtn>
      </VCardTitle>

      <!-- Summary bar -->
      <VCardText class="pb-0 pt-2">
        <VRow dense>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('Mode') }}</div>
            <div class="font-weight-medium">{{ job.transportType }}</div>
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('Provider') }}</div>
            <div class="font-weight-medium">{{ job.provider?.name ?? '—' }}</div>
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('Currency') }}</div>
            <div class="font-weight-medium">{{ job.currency ?? '—' }}</div>
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('Effective') }}</div>
            <div class="font-weight-medium">{{ job.effectiveDate?.slice(0, 10) ?? '—' }}</div>
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('Expiry') }}</div>
            <div class="font-weight-medium">{{ job.expiryDate?.slice(0, 10) ?? '—' }}</div>
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <div class="text-caption text-disabled">{{ $gettext('File') }}</div>
            <div class="font-weight-medium text-truncate" :title="job.fileName">{{ job.fileName ?? '—' }}</div>
          </VCol>
        </VRow>

        <!-- Row counts -->
        <div class="d-flex gap-4 mt-3 mb-2">
          <VChip size="small" variant="tonal">
            {{ $gettext('Total') }}: {{ job.totalRows }}
          </VChip>
          <VChip size="small" color="success" variant="tonal">
            {{ $gettext('Imported') }}: {{ job.rowsImported }}
          </VChip>
          <VChip size="small" color="default" variant="tonal">
            {{ $gettext('Skipped') }}: {{ job.rowsSkipped }}
          </VChip>
          <VChip v-if="job.rowsErrored" size="small" color="error" variant="tonal">
            {{ $gettext('Errors') }}: {{ job.rowsErrored }}
          </VChip>
          <VChip v-if="job.approvedBy" size="small" color="success" variant="tonal">
            <VIcon start icon="tabler-user-check" size="12" />
            {{ [job.approvedBy.firstName, job.approvedBy.lastName].join(' ') }}
          </VChip>
        </div>

        <!-- Error log -->
        <VAlert
          v-if="job.errorLog?.length"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-2"
        >
          <div class="font-weight-medium mb-1">{{ $gettext('Parse errors') }}</div>
          <div v-for="(err, i) in job.errorLog" :key="i" class="text-caption">
            Row {{ err.row }}: {{ err.error }}
          </div>
        </VAlert>
      </VCardText>

      <!-- Rows preview table -->
      <VDataTable
        :headers="rowHeaders"
        :items="job.rows ?? []"
        density="compact"
        :items-per-page="50"
        fixed-header
        height="420"
      >
        <template #item.action="{ item }">
          <VChip :color="actionColor[item.action] ?? 'default'" size="x-small" label>
            {{ item.action }}
          </VChip>
        </template>

        <template #item.isSanityFlagged="{ item }">
          <VIcon
            v-if="item.isSanityFlagged"
            icon="tabler-alert-triangle"
            size="16"
            color="warning"
            :title="$gettext('Rate moved >50% from previous')"
          />
        </template>

        <template #item.newBuyingAmount="{ item }">
          {{ item.newBuyingAmount ?? '—' }}
        </template>

        <template #item.newSellingAmount="{ item }">
          {{ item.newSellingAmount ?? '—' }}
        </template>

        <template #item.currentBuyingAmount="{ item }">
          {{ item.currentBuyingAmount ?? '—' }}
        </template>

        <template #item.changePct="{ item }">
          <span :class="pctColor(item.changePct)">{{ formatPct(item.changePct) }}</span>
        </template>

        <template #item.errorMessage="{ item }">
          <span class="text-caption text-error">{{ item.errorMessage ?? '' }}</span>
        </template>
      </VDataTable>
    </VCard>
  </VDialog>
</template>
