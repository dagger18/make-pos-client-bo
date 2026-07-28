<script setup>
import { enums as EbitNoteStatus, findByValue as findEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { filterConfigs, headers } from '@/config/tables/accounting/SOA';
import { dateAdapter } from "@/plugins/vuetify";
import ClientService from '@/services/ClientService';
import CommonService, { exchangeRatesToMap, printDate, availableCurrencies } from '@/services/CommonService';
// EbitNoteService and ProviderService removed - freight-specific services
const EntityService = null;
const ProviderService = null;
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import ShipmentDetail from '@/views/shipment/ShipmentDetail.vue';
import EbitNotePreview from '@/views/shipment/profit-loss/EbitNotePreview.vue';
const appStore = useAppStore()
definePage({
  meta: { action: 'MANAGE_SOA', subject: 'EbitNote', navActiveLink: 'accounting-id' },
})
const route = useRoute()
const getFilterConfigs = () => filterConfigs(route, appStore)
const targetType = ref(route.params.type)
const table = ref(null)
const preview = ref(null)
const shipmentDetail = ref(null)
const exportExcelCurrencySelectRef = ref(null)
const exportPDFCurrencySelectRef = ref(null)
const editExchangeRatesRef = ref(null)
function dateDiff(date) {
  return dateAdapter.getDiff(dateAdapter.parseISO(date), dateAdapter.date(), 'days')
}
const target = ref(null)
const TargetService = targetType.value === EbitNoteType.SOAClient 
                      ? ClientService : ProviderService
function exportExcel({currency}) {
  const { accessToken, user } = useAuthStore()
  const params =  {
                    export: true,
                    exportType: 'exportSOAExcel',
                    target: target.value.id,
                    YXV0aFRva2Vu: accessToken,
                    ZW1haWw: user.email,
                    rowType: 'Entity',
                    currency,
                    ...table.value.buildParamsForExport()
                  }
  const url = table.value.apiService.list(CommonService.serialize(params))
  window.open(url, '_blank')
  return true
}
function exportPDF({currency}) {
  const { accessToken, user } = useAuthStore()
  const params =  {
                    export: true,
                    exportType: 'exportSOAPdf',
                    target: target.value.id,
                    YXV0aFRva2Vu: accessToken,
                    ZW1haWw: user.email,
                    rowType: 'Entity',
                    currency,
                    ...table.value.buildParamsForExport()
                  }
  const url = table.value.apiService.list(CommonService.serialize(params))
  window.open(url, '_blank')
  return true
}
const currentExchangeRateGroup = ref(null)
async function editExchangeRates() {
  if(!currentExchangeRateGroup.value) {
    currentExchangeRateGroup.value = appStore.exchangeRatesConfig
  }
  editExchangeRatesRef.value.toggleMenu(true)
}
const exchangeRateMap = computed(() => {
  if (!currentExchangeRateGroup.value) return {}
  return exchangeRatesToMap(currentExchangeRateGroup.value.exchangeRates)
})
async function saveBatchExchangeRates(exchangeRates) {
  await EntityService.updateExchangeRates({
    ids: table.value.state.items.filter(item => item.selected).map(item => item.id),
    exchangeRates
  })
  table.value.fetchData()
}
function layoutCurrency() {
  const {required} = CommonService.rules()
  return [  
    [
      [
        { 
            name: 'currency', text: $gettext('Currency'), type: 'select', rules: [required],
            returnObject: false,
            items: availableCurrencies(appStore.exchangeRatesConfig.exchangeRates),
        }
      ],
    ]
  ]
}
function openExportExcelCurrencySelectDialog () {
  exportExcelCurrencySelectRef.value.setForm(true)
}
function openExportPDFCurrencySelectDialog () {
  exportPDFCurrencySelectRef.value.setForm(true)
}
onMounted(async () => {
  if(route.params.target) {
    target.value = await TargetService.get(route.params.target)
  }
})
async function saveBatchInvoiceDebitStatusDone() {
  await saveBatchInvoiceDebitStatus(EbitNoteStatus.Done)
}
async function saveBatchInvoiceDebitStatusActive() {
  await saveBatchInvoiceDebitStatus(EbitNoteStatus.Active)
}
async function saveBatchInvoiceDebitStatus(status) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to update status of this Invoice ? This might result in receipt or payment reocrd being created / removed.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    return
  }
  await EntityService.markInvoiceDebit({
    ids: table.value.state.items.filter(item => item.selected).map(item => item.id),
    status
  })
  table.value.fetchData()
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :key="target?.id ?? 0"
    :apiCallParam="{
      'filters[66][0]': 'type', 
      'filters[66][1]': 'inArray',
      'filters[66][2]': [
        EbitNoteType.InvoiceDebit, 
        EbitNoteType.InvoiceCredit
      ].join(','),
      'filters[67][0]': 'shalom',
      'filters[67][1]': 'subOrX',
      'filters[67][2][0][0]': 'collectFrom',
      'filters[67][2][0][1]': 'eq',
      'filters[67][2][0][2]': target?.id ?? 0,
      'filters[67][2][1][0]': 'payTo',
      'filters[67][2][1][1]': 'eq',
      'filters[67][2][1][2]': target?.id ?? 0,
    }"
    :selectable="[{
      text: $gettext('Export Excel'), 
      icon: 'tabler-file-spreadsheet', 
      action: openExportExcelCurrencySelectDialog
    }, {
      text: $gettext('Export PDF'), 
      icon: 'tabler-file-download', 
      action: openExportPDFCurrencySelectDialog
    }, {
      text: $gettext('Edit Exchange Rates'), 
      icon: 'tabler-report-money', 
      action: editExchangeRates
    }, {
      text: $gettext('Set Invoice Paid'), 
      icon: 'tabler-clipboard-check', 
      color: 'success',
      action: saveBatchInvoiceDebitStatusDone
    }, {
      text: $gettext('Set Invoice Unpaid'), 
      icon: 'tabler-ban', 
      color: 'error',
      action: saveBatchInvoiceDebitStatusActive
    }]"
    :pageTitle="''"
    :noResultText="$gettext('No result found! Please select another target')"
  >
    <template v-slot:title>
      <AccountingTabs :modelValue="targetType" />
    </template>
    <template #tableAction >
      <GoodSearchSelect
        v-model="target"
        :apiEndpoint="TargetService"
        :itemTitle="'name'"
        :itemValue="'id'"
        :placeholder="$gettext('Select target')"
        style="max-inline-size: 300px;min-inline-size: 200px;"
      />
    </template>
    <template #code="{item}">
      <VChip variant="text" color="primary" class="px-0" :ripple="false"
        @click="preview.openPreview(item)">
        {{ item.code }}
      </VChip>
    </template>
    <template #shipment="{item}">
      <VChip variant="text" color="primary" class="px-0" :ripple="false"
        @click="shipmentDetail.setEntity(item.shipment.id)">
        {{ item.shipment.code }}
      </VChip>
    </template>
    <template #status="{item}">
      <VChip variant="flat" class="d-flex px-1" :color="findEbitNoteStatus(item.status).colorInvoice">
        {{ findEbitNoteStatus(item.status).titleInvoice }}
      </VChip>
    </template>
    <template #dueDate="{item}">
      <div class="position-relative">
        {{ printDate(item.dueDate) }}
        <VChip v-if="dateDiff(item.dueDate) < 0"
          variant="outlined" color="error" size="x-small" class="px-1 position-absolute"
          style=" background: #fff;inset-block-start:-10px;inset-inline-end: 0; transform: translateX(50%);"
        >
          {{ -1*dateDiff(item.dueDate) }} {{ $gettext('day(s)') }}
        </VChip>
      </div>
    </template>
    <template #action="{ item }">
    </template>
  </AppTable>
  <EbitNotePreview ref="preview" removeDocumentScroll/>
  <ShipmentDetail
    ref="shipmentDetail"
    isDialog
    @closed="table.fetchData()"
  />
  <EditExchangeRates 
    ref="editExchangeRatesRef"
    :modelValue="exchangeRateMap"
    :toCurrency="appStore.exchangeRatesConfig.currency.code"
    :popupModalOnly="true"
    :saveableInitState="true"
    :attach="'.v-table'"
    @update:modelValue="saveBatchExchangeRates($event)"
  />
  <DialogForm
    ref="exportExcelCurrencySelectRef"
    :apiService="{'add': exportExcel}"
    :modelValue="{
      currency: appStore.exchangeRatesConfig.currency.code,
    }" 
    :layout="layoutCurrency"
    :class="'mt-n2'"
  >
    <template #activator="props">
      
    </template>
  </DialogForm>
  <DialogForm
    ref="exportPDFCurrencySelectRef"
    :apiService="{'add': exportPDF}"
    :modelValue="{
      currency: appStore.exchangeRatesConfig.currency.code,
    }" 
    :layout="layoutCurrency"
    :class="'mt-n2'"
  >
    <template #activator="props">
      
    </template>
  </DialogForm>
</template>
