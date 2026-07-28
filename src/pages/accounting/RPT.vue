<script setup>
import { findByValue as findEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { filterConfigs, headers } from '@/config/tables/accounting/RPT';
import { dateAdapter } from "@/plugins/vuetify";
import { printDate } from '@/services/CommonService';
// EbitNoteService removed - freight-specific service
const EntityService = null;
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import ShipmentDetail from '@/views/shipment/ShipmentDetail.vue';
import EbitNotePreview from '@/views/shipment/profit-loss/EbitNotePreview.vue';
definePage({ 
  meta: { action: 'MANAGE_RPT', subject: 'EbitNote', navActiveLink: 'accounting-id' },
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
async function deleteRecord(entity, buttonComponent) {
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
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :apiCallParam="{'filter_type': EbitNoteType.RecordReceipt}"
    :pageTitle="''"
  >
    <template v-slot:title>
      <AccountingTabs :modelValue="EbitNoteType.RecordReceipt" />
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
    <template #fx_gain_loss="{ item }">
      <span v-if="item.fxGainLoss !== null && item.fxGainLoss !== undefined"
        :class="item.fxGainLoss >= 0 ? 'text-success' : 'text-error'"
      >
        {{ item.fxGainLoss >= 0 ? '+' : '' }}{{ Number(item.fxGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
      </span>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #action="{ item }">
      <SubmitBtn
        @click="deleteRecord(item, $refs['delete-' + item.id])"
        :title="$gettext('Delete Record')"
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
