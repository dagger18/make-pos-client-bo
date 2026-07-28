<script setup>
import { useGettext } from 'vue3-gettext'
import SalesCrmService from '@/services/SalesCrmService'
import UserService from '@/services/UserService'
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-charge' } })

const { $gettext } = useGettext()

const targets  = ref([])
const users    = ref([])
const loading  = ref(false)
const saving   = ref(false)
const dialog   = ref(false)
const editId   = ref(null)
const year     = ref(new Date().getFullYear())

const TARGET_TYPES = ['REVENUE', 'PROFIT', 'NEW_CUSTOMERS', 'QUOTES_SENT']
const MONTHS = [
  { title: 'Annual', value: null },
  { title: 'Jan', value: 1 }, { title: 'Feb', value: 2 }, { title: 'Mar', value: 3 },
  { title: 'Apr', value: 4 }, { title: 'May', value: 5 }, { title: 'Jun', value: 6 },
  { title: 'Jul', value: 7 }, { title: 'Aug', value: 8 }, { title: 'Sep', value: 9 },
  { title: 'Oct', value: 10 }, { title: 'Nov', value: 11 }, { title: 'Dec', value: 12 },
]

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const emptyForm = () => ({
  salesRepId: null, periodYear: year.value, periodMonth: null,
  targetType: 'REVENUE', targetValue: null, currency: 'USD', branchId: null,
})
const form = ref(emptyForm())

const headers = computed(() => [
  { title: $gettext('Sales Rep'), key: 'salesRep' },
  { title: $gettext('Period'), key: 'period', width: 100 },
  { title: $gettext('Type'), key: 'targetType', width: 140 },
  { title: $gettext('Target Value'), key: 'targetValue', align: 'end', width: 140 },
  { title: $gettext('Currency'), key: 'currency', width: 90 },
  { title: '', key: 'actions', sortable: false, width: 80 },
])

const yearOptions = computed(() => {
  const cur = new Date().getFullYear()
  return [cur - 1, cur, cur + 1]
})

async function load() {
  loading.value = true
  targets.value = await SalesCrmService.listTargets(year.value)
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
    periodYear: item.periodYear,
    periodMonth: item.periodMonth ?? null,
    targetType: item.targetType,
    targetValue: item.targetValue,
    currency: item.currency ?? 'USD',
    branchId: item.branch?.id ?? null,
  }
  dialog.value = true
}

async function save() {
  saving.value = true
  try {
    if (editId.value) {
      await SalesCrmService.updateTarget(editId.value, form.value)
    } else {
      await SalesCrmService.createTarget(form.value)
    }
    dialog.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm($gettext('Delete this target?'))) return
  await SalesCrmService.deleteTarget(id)
  await load()
}

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

watch(year, () => load())
onMounted(() => { load(); loadUsers() })
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VSpacer />
      <VCol cols="auto">
        <VSelect
          v-model="year"
          :items="yearOptions"
          density="compact"
          hide-details
          style="min-width: 100px"
        />
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
          {{ $gettext('New Target') }}
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable :headers="headers" :items="targets" :loading="loading" density="compact">
        <template #item.salesRep="{ item }">{{ item.salesRep?.name ?? '—' }}</template>
        <template #item.period="{ item }">
          {{ item.periodMonth ? `${MONTH_NAMES[item.periodMonth]} ${item.periodYear}` : `FY ${item.periodYear}` }}
        </template>
        <template #item.targetType="{ item }">
          <VChip size="x-small" color="primary">{{ item.targetType.replace('_', ' ') }}</VChip>
        </template>
        <template #item.targetValue="{ item }">
          {{ fmt(item.targetValue) }}
        </template>
        <template #item.actions="{ item }">
          <VBtn size="x-small" icon variant="text" @click="openEdit(item)">
            <VIcon>tabler-pencil</VIcon>
          </VBtn>
          <VBtn size="x-small" icon variant="text" color="error" @click="remove(item.id)">
            <VIcon>tabler-trash</VIcon>
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <VDialog v-model="dialog" max-width="560px" persistent>
      <VCard :title="editId ? $gettext('Edit Target') : $gettext('New Target')">
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
            <VCol cols="12" md="3">
              <VTextField v-model.number="form.periodYear" type="number" :label="$gettext('Year')" density="compact" />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect
                v-model="form.periodMonth"
                :items="MONTHS"
                item-title="title"
                item-value="value"
                :label="$gettext('Month')"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.targetType"
                :items="TARGET_TYPES"
                :label="$gettext('Target Type')"
                density="compact"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model.number="form.targetValue" type="number" :label="$gettext('Target Value')" density="compact" />
            </VCol>
            <VCol cols="12" md="2">
              <VTextField v-model="form.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
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
