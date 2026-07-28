<script setup>
import { useGettext } from 'vue3-gettext'
import SalesCrmService from '@/services/SalesCrmService'
import UserService from '@/services/UserService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-charge' } })

const { $gettext } = useGettext()

const commissions = ref([])
const users       = ref([])
const loading     = ref(false)
const saving      = ref(false)
const dialog      = ref(false)
const editId      = ref(null)
const filterStatus = ref(null)
const filterRepId  = ref(null)

const STATUSES = ['CALCULATED', 'APPROVED', 'PAID']
const BASES    = ['PCT_REVENUE', 'PCT_PROFIT', 'FLAT']

const STATUS_COLOR = { CALCULATED: 'info', APPROVED: 'warning', PAID: 'success' }

const emptyForm = () => ({
  salesRepId: null, shipmentId: null, commissionBasis: 'PCT_REVENUE',
  commissionRate: null, baseAmount: null, commissionAmount: null,
  currency: 'USD', status: 'CALCULATED', periodMonth: '',
})
const form = ref(emptyForm())

const headers = computed(() => [
  { title: $gettext('Sales Rep'), key: 'salesRep' },
  { title: $gettext('Shipment'), key: 'shipmentCode', width: 130 },
  { title: $gettext('Basis'), key: 'commissionBasis', width: 120 },
  { title: $gettext('Rate'), key: 'commissionRate', align: 'end', width: 90 },
  { title: $gettext('Base Amount'), key: 'baseAmount', align: 'end', width: 120 },
  { title: $gettext('Commission'), key: 'commissionAmount', align: 'end', width: 120 },
  { title: $gettext('Currency'), key: 'currency', width: 90 },
  { title: $gettext('Period'), key: 'periodMonth', width: 90 },
  { title: $gettext('Status'), key: 'status', width: 120 },
  { title: '', key: 'actions', sortable: false, width: 110 },
])

const filteredCommissions = computed(() => {
  let list = commissions.value
  if (filterStatus.value) list = list.filter(c => c.status === filterStatus.value)
  if (filterRepId.value)  list = list.filter(c => c.salesRep?.id === filterRepId.value)
  return list
})

const totals = computed(() => ({
  base: filteredCommissions.value.reduce((s, c) => s + Number(c.baseAmount ?? 0), 0),
  commission: filteredCommissions.value.reduce((s, c) => s + Number(c.commissionAmount ?? 0), 0),
}))

async function load() {
  loading.value = true
  commissions.value = await SalesCrmService.listCommissions()
  loading.value = false
}

async function loadUsers() {
  const res = await UserService.getAll?.() ?? []
  users.value = Array.isArray(res) ? res : (res?.list ?? res?.data ?? [])
}

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    salesRepId: item.salesRep?.id ?? null,
    shipmentId: item.shipmentId ?? null,
    commissionBasis: item.commissionBasis,
    commissionRate: item.commissionRate ?? null,
    baseAmount: item.baseAmount,
    commissionAmount: item.commissionAmount,
    currency: item.currency ?? 'USD',
    status: item.status,
    periodMonth: item.periodMonth ?? '',
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await SalesCrmService.updateCommission(editId.value, form.value)
    } else {
      await SalesCrmService.createCommission(form.value)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function approve(id) {
  await SalesCrmService.approveCommission(id)
  await load()
}

async function markPaid(id) {
  await SalesCrmService.payCommission(id)
  await load()
}

async function remove(id) {
  if (!confirm($gettext('Delete this commission record?'))) return
  await SalesCrmService.deleteCommission(id)
  await load()
}

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtRate = (v) => v ? (Number(v) * 100).toFixed(2) + '%' : '—'

onMounted(() => { load(); loadUsers() })
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VSpacer />
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
          {{ $gettext('Add Commission') }}
        </VBtn>
      </VCol>
    </VRow>

    <VRow class="mb-3">
      <VCol cols="12" sm="3">
        <VSelect
          v-model="filterStatus"
          :items="[{ title: $gettext('All Statuses'), value: null }, ...STATUSES.map(s => ({ title: s, value: s }))]"
          :label="$gettext('Filter by Status')"
          density="compact"
          hide-details
          clearable
        />
      </VCol>
      <VCol cols="12" sm="3">
        <VSelect
          v-model="filterRepId"
          :items="users"
          item-title="name"
          item-value="id"
          :label="$gettext('Filter by Rep')"
          density="compact"
          hide-details
          clearable
        />
      </VCol>
    </VRow>

    <!-- Summary bar -->
    <VRow class="mb-3">
      <VCol cols="6" sm="3">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Total Base Amount') }}</div>
            <div class="text-h6 font-weight-bold">{{ fmt(totals.base) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="3">
        <VCard color="primary" variant="tonal">
          <VCardText class="pa-3">
            <div class="text-caption">{{ $gettext('Total Commission') }}</div>
            <div class="text-h6 font-weight-bold">{{ fmt(totals.commission) }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="filteredCommissions" :loading="loading" density="compact">
        <template #item.salesRep="{ item }">{{ item.salesRep?.name ?? '—' }}</template>
        <template #item.shipmentCode="{ item }">{{ item.shipmentCode ?? item.shipmentId ?? '—' }}</template>
        <template #item.commissionBasis="{ item }">
          <VChip size="x-small" color="default">{{ item.commissionBasis.replace('_', ' ') }}</VChip>
        </template>
        <template #item.commissionRate="{ item }">{{ fmtRate(item.commissionRate) }}</template>
        <template #item.baseAmount="{ item }">{{ fmt(item.baseAmount) }}</template>
        <template #item.commissionAmount="{ item }">{{ fmt(item.commissionAmount) }}</template>
        <template #item.status="{ item }">
          <VChip size="x-small" :color="STATUS_COLOR[item.status] ?? 'default'">{{ item.status }}</VChip>
        </template>
        <template #item.actions="{ item }">
          <VBtn size="x-small" icon variant="text" @click="openEdit(item)">
            <VIcon>tabler-pencil</VIcon>
          </VBtn>
          <VBtn
            v-if="item.status === 'CALCULATED'"
            size="x-small" icon variant="text" color="warning"
            @click="approve(item.id)"
          >
            <VIcon>tabler-check</VIcon>
            <VTooltip activator="parent">{{ $gettext('Approve') }}</VTooltip>
          </VBtn>
          <VBtn
            v-if="item.status === 'APPROVED'"
            size="x-small" icon variant="text" color="success"
            @click="markPaid(item.id)"
          >
            <VIcon>tabler-currency-dollar</VIcon>
            <VTooltip activator="parent">{{ $gettext('Mark Paid') }}</VTooltip>
          </VBtn>
          <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)">
            <VIcon>tabler-trash</VIcon>
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <VDialog v-model="dialog" max-width="580px" persistent>
      <VCard :title="editId ? $gettext('Edit Commission') : $gettext('Add Commission')">
        <DialogCloseBtn @click="dialog = false" />
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.salesRepId"
                :items="users"
                item-title="name"
                item-value="id"
                :label="$gettext('Sales Rep')"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model.number="form.shipmentId" type="number" :label="$gettext('Shipment ID')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model="form.commissionBasis"
                :items="BASES"
                :label="$gettext('Basis')"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.number="form.commissionRate"
                type="number"
                step="0.0001"
                :label="$gettext('Rate (decimal, e.g. 0.05)')"
                density="compact"
                clearable
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="form.periodMonth" :label="$gettext('Period (YYYY-MM)')" density="compact" clearable />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="form.baseAmount" type="number" :label="$gettext('Base Amount')" density="compact" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="form.commissionAmount" type="number" :label="$gettext('Commission Amount')" density="compact" />
            </VCol>
            <VCol cols="12" md="2">
              <VTextField v-model="form.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
            </VCol>
            <VCol cols="12" md="2">
              <VSelect v-model="form.status" :items="STATUSES" :label="$gettext('Status')" density="compact" />
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
  </VContainer>
</template>
