<script setup>
import { enums as EbitNoteStatus, findByValue as findEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { headers as exportPricesHeaders } from '@/config/tables/accounting/ChargeItem';
import { filterConfigs, headers } from '@/config/tables/accounting/ID';
import { dateAdapter } from "@/plugins/vuetify";
import ChargeItemService from '@/services/ChargeItemService';
import CommonService, { printDate } from '@/services/CommonService';
import EntityService from '@/services/EbitNoteService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import ShipmentDetail from '@/views/shipment/ShipmentDetail.vue';
import EbitNotePreview from '@/views/shipment/profit-loss/EbitNotePreview.vue';
definePage({ 
  meta: { action: 'MANAGE_ID', subject: 'EbitNote', navActiveLink: 'accounting-id' },
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(route, appStore)
const table = ref(null)
const preview = ref(null)
const shipmentDetail = ref(null)
const { userAbilityRules } = useAuthStore()
function dateDiff(date) {
  return dateAdapter.getDiff(dateAdapter.parseISO(date), dateAdapter.date(), 'days')
}
async function deleteInvoice(entity, buttonComponent) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to delete this entity? This might result in data loss. You should delete all dependencies of this entity first.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    buttonComponent.disabled = false
    return
  }
  buttonComponent.addToQueuingList()
  const result = await EntityService.delete(
    entity.id, {
      parentType: 'shipment',
      parentId: entity.shipment.id,
      parentProperty: 'ebitNote'
    }
  )
  if (result) {
    table.value.fetchData()
  }
}
function exportExcel() {
  const { accessToken, user } = useAuthStore()
  const params =  {
                    export: true,
                    YXV0aFRva2Vu: accessToken,
                    ZW1haWw: user.email,
                    rowType: 'Entity',
                    ...table.value.buildParamsForExport()
                  }
  const url = table.value.apiService.list(CommonService.serialize(params))
  window.open(url, '_blank')
}
function buildParamsForExportPrices() {
  let params = {}
  exportPricesHeaders().forEach((header, index) => {
    params[`columns[${index}]`] = encodeURIComponent(header.reportKey ?? header.key)
    params[`title[${index}]`] = encodeURIComponent(header.text)
  })
  params['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  params[`filters[0][0]`] = 'ebitNote'
  params[`filters[0][1]`] = 'inArray'
  params[`filters[0][2]`] = table.value.state.items.filter(item => item.selected).map(item => item.id).join(',')
  return params
}
function exportPrices() {
  const { accessToken, user } = useAuthStore()
  const params =  {
                    export: true,
                    YXV0aFRva2Vu: accessToken,
                    ZW1haWw: user.email,
                    rowType: 'Entity',
                    ...buildParamsForExportPrices()
                  }
  
  const url = ChargeItemService.list(CommonService.serialize(params))
  window.open(url, '_blank')
}
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
    :apiCallParam="{'filter_type': EbitNoteType.InvoiceDebit}"
    :pageTitle="''"
    :selectable="[{
      text: $gettext('Export Excel'), 
      icon: 'tabler-file-download', 
      action: exportExcel
    }, {
      text: $gettext('Export Prices'), 
      icon: 'tabler-message-2-dollar', 
      action: exportPrices
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
  >
    <template v-slot:title>
      <AccountingTabs :modelValue="EbitNoteType.InvoiceDebit" />
    </template>
    <template #tableAction >
      <InvoiceDownloadMonthly :ebitNoteType="EbitNoteType.InvoiceDebit" />
    </template>
    <template #code="{item}">
      <VChip variant="text" color="primary" class="px-0" :ripple="false"
        @click="preview.openPreview(item)">
        {{ item.code }}
      </VChip>
    </template>
    <template #parentNote="{item}">
      <VChip variant="text" color="primary" class="px-0" :ripple="false"
        @click="preview.openPreview(item.parentNote)">
        {{ item.parentNote.code }}
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
      <SubmitBtn
        @click="deleteInvoice(item, $refs['delete-' + item.id])"
        :title="$gettext('Delete Invoice')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        :autoQueue="false"
        :ref="'delete-' + item.id"
        size="x-small"
      >
        <VIcon icon="tabler-trash" size="18"/>
      </SubmitBtn>
    </template>
  </AppTable>
  <EbitNotePreview ref="preview" removeDocumentScroll/>
  <ShipmentDetail
    ref="shipmentDetail"
    isDialog
    @closed="table.fetchData()"
  />
</template>
