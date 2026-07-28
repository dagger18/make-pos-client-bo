<script setup>
import { useGettext } from 'vue3-gettext'
import VatReportService from '@/services/VatReportService'
definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()
const loading = ref(false)
const dateFrom = ref(new Date().toISOString().slice(0, 8) + '01')
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const report   = ref(null)

const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function load() {
  loading.value = true
  report.value = await VatReportService.getVatReport(dateFrom.value, dateTo.value)
  loading.value = false
}

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow class="mb-4">
      <VCol cols="12" sm="3">
        <VTextField v-model="dateFrom" type="date" :label="$gettext('From')" density="compact" hide-details />
      </VCol>
      <VCol cols="12" sm="3">
        <VTextField v-model="dateTo" type="date" :label="$gettext('To')" density="compact" hide-details />
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" :loading="loading" @click="load">{{ $gettext('Run') }}</VBtn>
      </VCol>
    </VRow>

    <template v-if="report">
      <VCard class="mb-6">
        <VCardTitle class="text-subtitle-1 font-weight-semibold pa-4">{{ $gettext('Output Tax (Sales / AR Invoices)') }}</VCardTitle>
        <VTable density="compact">
          <thead>
            <tr>
              <th>{{ $gettext('Period') }}</th><th>{{ $gettext('Tax Code') }}</th><th class="text-right">{{ $gettext('Rate') }}</th>
              <th class="text-right">{{ $gettext('Taxable Amount') }}</th><th class="text-right">{{ $gettext('Tax Amount') }}</th><th class="text-right">{{ $gettext('Invoices') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td></tr>
            <tr v-else-if="!report.outputTax.length"><td colspan="6" class="text-center text-medium-emphasis pa-4">{{ $gettext('No output tax for period.') }}</td></tr>
            <tr v-for="r in report.outputTax" :key="r.tax_period + r.tax_code">
              <td>{{ r.tax_period }}</td>
              <td class="font-weight-medium">{{ r.tax_code }}</td>
              <td class="text-right">{{ (r.tax_rate * 100).toFixed(2) }}%</td>
              <td class="text-right">{{ fmt(r.taxable_amount) }}</td>
              <td class="text-right text-success font-weight-bold">{{ fmt(r.tax_amount) }}</td>
              <td class="text-right">{{ r.invoice_count }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>

      <VCard class="mb-6">
        <VCardTitle class="text-subtitle-1 font-weight-semibold pa-4">{{ $gettext('Input Tax (Purchases / AP Invoices)') }}</VCardTitle>
        <VTable density="compact">
          <thead>
            <tr>
              <th>{{ $gettext('Period') }}</th><th>{{ $gettext('Tax Code') }}</th><th class="text-right">{{ $gettext('Rate') }}</th>
              <th class="text-right">{{ $gettext('Taxable Amount') }}</th><th class="text-right">{{ $gettext('Tax Amount') }}</th><th class="text-right">{{ $gettext('Invoices') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td></tr>
            <tr v-else-if="!report.inputTax.length"><td colspan="6" class="text-center text-medium-emphasis pa-4">{{ $gettext('No input tax for period.') }}</td></tr>
            <tr v-for="r in report.inputTax" :key="r.tax_period + r.tax_code">
              <td>{{ r.tax_period }}</td>
              <td class="font-weight-medium">{{ r.tax_code }}</td>
              <td class="text-right">{{ (r.tax_rate * 100).toFixed(2) }}%</td>
              <td class="text-right">{{ fmt(r.taxable_amount) }}</td>
              <td class="text-right text-error font-weight-bold">{{ fmt(r.tax_amount) }}</td>
              <td class="text-right">{{ r.invoice_count }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>

      <VCard class="mb-6" color="surface-variant">
        <VCardText>
          <div class="text-subtitle-1 font-weight-semibold mb-2">{{ $gettext('Net VAT Payable') }}</div>
          <div
            class="text-h4 font-weight-bold"
            :class="report.netVatPayable >= 0 ? 'text-error' : 'text-success'"
          >
            {{ fmt(report.netVatPayable) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">{{ $gettext('Output Tax − Input Tax. Positive = payable to authority.') }}</div>
        </VCardText>
      </VCard>

      <VCard v-if="report.withholdingTax.length">
        <VCardTitle class="text-subtitle-1 font-weight-semibold pa-4">{{ $gettext('Withholding Tax') }}</VCardTitle>
        <VTable density="compact">
          <thead>
            <tr>
              <th>{{ $gettext('Period') }}</th><th>{{ $gettext('Reference') }}</th><th class="text-right">{{ $gettext('Rate') }}</th>
              <th class="text-right">{{ $gettext('WHT Amount') }}</th><th class="text-right">{{ $gettext('Invoices') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in report.withholdingTax" :key="r.tax_period + r.withholding_tax_ref">
              <td>{{ r.tax_period }}</td>
              <td>{{ r.withholding_tax_ref ?? '—' }}</td>
              <td class="text-right">{{ r.withholding_tax_rate ? (r.withholding_tax_rate * 100).toFixed(2) + '%' : '—' }}</td>
              <td class="text-right font-weight-bold">{{ fmt(r.withholding_amount) }}</td>
              <td class="text-right">{{ r.invoice_count }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
  </VContainer>
</template>
