<script setup>
import { filterConfigs, headers } from '@/config/tables/InsuranceDeclaration'
import InsuranceService from '@/services/InsuranceService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-vat-report' } })

const { $gettext } = useGettext()

const table   = ref(null)
const policies = ref([])
const saving  = ref(false)
const dialog  = ref(false)

const form = ref({
  policyId:   null,
  periodFrom: '',
  periodTo:   '',
  currency:   'USD',
})

const STATUS_COLOR = { DRAFT: 'default', SUBMITTED: 'info', ACKNOWLEDGED: 'success' }

const declarationService = { list: (params) => InsuranceService.listDeclarations(params) }

const buttons = computed(() => [{ text: $gettext('New Declaration'), func: () => { dialog.value = true } }])

async function loadPolicies() {
  policies.value = await InsuranceService.listPolicies()
}

async function save() {
  saving.value = true
  try {
    await InsuranceService.createDeclaration(form.value)
    dialog.value = false
    form.value = { policyId: null, periodFrom: '', periodTo: '', currency: 'USD' }
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function submit(id) {
  await InsuranceService.submitDeclaration(id)
  await table.value?.fetchData()
}

async function acknowledge(id) {
  await InsuranceService.acknowledgeDeclaration(id)
  await table.value?.fetchData()
}

async function remove(id) {
  if (!confirm('Delete this declaration?')) return
  await InsuranceService.deleteDeclaration(id)
  await table.value?.fetchData()
}

onMounted(loadPolicies)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="declarationService"
    :pageTitle="$gettext('Insurance Declarations')"
    :buttons="buttons"
  >
    <template #beforeTable>
      <p class="text-body-2 text-medium-emphasis mb-0 px-4 pb-2">
        {{ $gettext('Monthly declarations to the insurer under open cover policies') }}
      </p>
    </template>

    <template #status="{ item }">
      <VChip size="x-small" :color="STATUS_COLOR[item.status] ?? 'default'">{{ item.status }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn
        v-if="item.status === 'DRAFT'"
        size="x-small" variant="tonal" color="info" class="me-1"
        @click="submit(item.id)"
      >
        {{ $gettext('Submit') }}
      </VBtn>
      <VBtn
        v-if="item.status === 'SUBMITTED'"
        size="x-small" variant="tonal" color="success" class="me-1"
        @click="acknowledge(item.id)"
      >
        {{ $gettext('Acknowledge') }}
      </VBtn>
      <VBtn
        v-if="item.status === 'DRAFT'"
        size="x-small" icon variant="text" color="error"
        @click="remove(item.id)"
      >
        <VIcon>tabler-trash</VIcon>
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="480px" persistent>
    <VCard :title="$gettext('New Declaration')">
      <DialogCloseBtn @click="dialog = false" />
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VSelect
              v-model="form.policyId"
              :items="policies"
              item-title="policyNumber"
              item-value="id"
              :label="$gettext('Policy')"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.periodFrom" type="date" :label="$gettext('Period From')" density="compact" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.periodTo" type="date" :label="$gettext('Period To')" density="compact" />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField v-model="form.currency" :label="$gettext('Currency')" density="compact" maxlength="3" />
          </VCol>
        </VRow>
        <p class="text-caption text-medium-emphasis mt-2">
          {{ $gettext('All certificates issued under the selected policy within the period will be automatically included.') }}
        </p>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Generate') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
