<script setup>
import { findByValue as findEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { makeDefaultEntity as defaultCOBO, layout as layoutCOBO } from '@/config/forms/shipment/COBO';
import { makeDefaultEntity as defaultPOBO, layout as layoutPOBO } from '@/config/forms/shipment/POBO';
import { makeDefaultEntity as paymentDefault, layout as paymentLayout } from '@/config/forms/shipment/RecordPayment';
import { makeDefaultEntity as receiptDefault, layout as receiptLayout } from '@/config/forms/shipment/RecordReceipt';
import { headers as headersInvoiceCredit } from '@/config/tables/shipment/InvoiceCredit';
import { headers as headersInvoiceDebit } from '@/config/tables/shipment/InvoiceDebit';
import { getCurrencyRate, recalculateChargeItemPrice, transformArray, transformPreSubmit } from '@/services/CommonService';
// EbitNoteService removed - freight-specific service
const EntityService = null;
import { useAppStore } from '@/stores/appStore';
import EbitNotePreview from './EbitNotePreview.vue';
import RecordForm from './RecordForm.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
useAppStore().getList('exchangeRateGroups')
useAppStore().getList('taxGroups')
const formPOBO = ref(null)
const formCOBO = ref(null)
const tablePOBO = ref(null)
const tableCOBO = ref(null)
const preview = ref(null)
const recordReceiptForm = ref(null)
const recordPaymentForm = ref(null)
const emit = defineEmits(['shipmentChanged'])
function recalculateTotal(entity) {
  const total = entity.chargeItems.reduce((result, chargeItem) => {
    if(!result.amountNoTax.hasOwnProperty('currency')) {
      result.amountNoTax.currency = chargeItem.chargePrice.currency
      result.amountNoTax.rate = chargeItem.chargePrice.rate
      result.amountNoTax.amount = 0
      result.tax.currency = chargeItem.chargePrice.currency
      result.tax.rate = chargeItem.chargePrice.rate
      result.tax.amount = 0
      result.amount.currency = chargeItem.chargePrice.currency
      result.amount.rate = chargeItem.chargePrice.rate
      result.amount.amount = 0
    }
    result.amountNoTax.amount += chargeItem.amount?.amount ?? 0
    result.tax.amount += chargeItem.tax?.amount ?? 0
    result.amount.amount = 1*result.amountNoTax.amount + 1*result.tax.amount
    return result
  }, {
    amountNoTax: {},
    tax: {},
    amount: {}
  })
  if(JSON.stringify(total.amountNoTax) !== JSON.stringify(entity.amountNoTax)) {
    entity.amountNoTax = total.amountNoTax
  }
  if(JSON.stringify(total.tax) !== JSON.stringify(entity.tax)) {
    entity.tax = total.tax
  }
  if(JSON.stringify(total.amount) !== JSON.stringify(entity.amount)) {
    entity.amount = total.amount
  }
}

function recalculateExchangeRates(entity) {
  const currentRate = useAppStore()
    .exchangeRatesConfig
  const currencyMap = entity.chargeItems.reduce((result, chargeItem) => {
    ['price', 'chargePrice'].forEach(key => {
      if(!chargeItem[key]) return
      const currency = chargeItem[key].currency
      if(result.hasOwnProperty(currency)) return
      result[currency] = entity.exchangeRates.hasOwnProperty(currency) 
                  ? (1*entity.exchangeRates[currency])
                  : getCurrencyRate(currentRate.exchangeRates, currency)
    })
    return result
  }, {})
  if(JSON.stringify(currencyMap) !== JSON.stringify(entity.exchangeRates)) {
    // todo: should merge here, not set, but right now all exchange rates are here
    entity.exchangeRates = currencyMap
  }
}
function onCurrencyChanged(entity, columns, value) {
  if(!entity.exchangeRates.hasOwnProperty(entity.currency)) {
    const currentRate = useAppStore()
    .exchangeRatesConfig
    entity.exchangeRates[entity.currency] = getCurrencyRate(currentRate.exchangeRates, entity.currency)
  }
  entity.chargeItems.forEach(chargeItem => {
    ['price', 'chargePrice', 'amount', 'tax'].forEach(key => {
      if(chargeItem[key]) {
        chargeItem[key].currency = entity.currency
        chargeItem[key].rate = entity.exchangeRates[chargeItem[key].currency]*1
      }
    })
    recalculateChargeItemPrice(
      chargeItem, 
      { 
        exchangeRates: entity.exchangeRates, 
        currency: entity.currency, 
        moneyScale: entity.moneyScale
      }
    )
  })
  recalculateTotal(entity)
  recalculateExchangeRates(entity)
}
function onExchangeRatesChanged(entity, columns, value) {
  console.log('exchangeRate changed', entity.exchangeRates)
  entity.chargeItems.forEach(chargeItem => {
    ['price', 'chargePrice', 'amount', 'tax'].forEach(key => {
      if(chargeItem[key]) {
        chargeItem[key].rate = entity.exchangeRates[chargeItem[key].currency]*1
      }
    })
    recalculateChargeItemPrice(
      chargeItem, 
      { 
        exchangeRates: entity.exchangeRates, 
        currency: entity.currency, 
        moneyScale: entity.moneyScale
      }
    )
  })
  recalculateTotal(entity)
}
function onChargeItemsChanged(entity, columns, value) {
  recalculateTotal(entity)
  recalculateExchangeRates(entity)
}
function onMoneyScaleChanged(entity, columns, value) {
  entity.chargeItems.forEach(chargeItem => {
    recalculateChargeItemPrice(
      chargeItem, 
      { 
        exchangeRates: entity.exchangeRates, 
        currency: entity.currency, 
        moneyScale: entity.moneyScale
      }
    )
  })
  recalculateTotal(entity)
}
function entityPreSubmit (reactedEntity) {
  let entity = reactedEntity
  
  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
  if (entity.chargeItems && entity.chargeItems.length > 0) {
    transformArray(entity, 'chargeItems')
  }
  if (entity.documents && entity.documents.length > 0) {
    entity.documents.forEach((object, index) => {
      if(!object) return
      if ('id' in object && object.id !== 'holded') {
        entity[`documents[${index}]`] = object.id
      }
      if('file' in object) {
        entity[`documents[${index}]`] = object.file
      }
    })
    delete entity.documents
  }
  entity.parentId = props.shipment.id
  entity.parentType = 'shipment'
  entity.parentProperty = 'ebitNote'
  console.log('final object', JSON.parse(JSON.stringify(entity)))

  return entity
}
async function deleteEbitNote (entity, buttonComponent) {
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
      parentId: props.shipment.id,
      parentProperty: 'ebitNote'
    }
  )
  if (result) {
    emit('shipmentChanged')
  }
}
async function editEntity (entityId) {
  const entity = await EntityService.get(entityId, {
    parentId: props.shipment.id,
    parentType: 'shipment',
    parentProperty: 'ebitNote'
  })
  form.value.setEntity(entity)
}
onMounted(() => {
  nextTick(() => {
    tableCOBO.value.checkVerticalScroll()
    tablePOBO.value.checkVerticalScroll()
  })
})
const shipmentEditable = computed(() => {
  return props.shipment 
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
</script>
<template>
<AppTableInline
  ref="tablePOBO"
  :headers="headersInvoiceCredit(true)"
  :items="shipment.ebitNotes.filter(e => e.type === EbitNoteType.POBO)"
>
  <template #title>
    <div class="font-weight-bold text-uppercase d-flex align-center h-100">
      {{ $gettext('Payment on behalf of') }} (POBO)
    </div>
  </template>
  <template #buttons>
    <VBtn v-if="shipmentEditable" size="small" @click="formPOBO.setEntity()">
      <VIcon icon="tabler-plus" class="ms-n2 me-1" size="21"></VIcon>
      {{ $gettext('Add POBO Invoice') }}
    </VBtn>
  </template>
  <template #status="{item}">
    <VChip variant="flat" class="d-flex px-1" :color="findEbitNoteStatus(item.status).colorInvoice">
      {{ findEbitNoteStatus(item.status).titleInvoice }}
    </VChip>
  </template>
  <template #files="{item}">
    <EbitNoteDocuments 
      :documents="item.documents" 
      v-if="item.documents.length > 0"
      :class="'text-decoration-underline'"
    />
  </template>
  <template #action="{ item }">
    <v-btn
      v-if="shipmentEditable"
      @click="recordPaymentForm.setEntity(item)"
      :title="$gettext('Add Payment Record')"
      class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
      size="x-small"
    >
      <VIcon icon="tabler-receipt" size="18"/>
    </v-btn>
    <v-btn
      @click="preview.openPreview(item)"
      :title="$gettext('preview')"
      class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
      size="x-small"
    >
      <VIcon icon="tabler-eye" size="18"/>
    </v-btn>
    <SubmitBtn
      v-if="shipmentEditable"
      @click="deleteEbitNote(item, $refs['delete-' + item.id])"
      :title="$gettext('delete')"
      class="mx-0 px-0 ms-n2 me-n3" variant="text"
      :autoQueue="false"
      :ref="'delete-' + item.id"
      size="x-small"
    >
      <VIcon icon="tabler-trash" size="18"/>
    </SubmitBtn>
  </template>
</AppTableInline>
<AppTableInline
  ref="tableCOBO"
  :headers="headersInvoiceDebit(true)"
  :items="shipment.ebitNotes.filter(e => e.type === EbitNoteType.COBO)"
>
  <template #title>
    <div class="font-weight-bold text-uppercase d-flex align-center h-100">
      {{ $gettext('Collection on behalf of') }} (COBO)
    </div>
  </template>
  <template #buttons>
    <VBtn v-if="shipmentEditable" size="small" @click="formCOBO.setEntity()">
      <VIcon icon="tabler-plus" class="ms-n2 me-1" size="21"></VIcon>
      {{ $gettext('Add COBO Invoice') }}
    </VBtn>
  </template>
  <template #status="{item}">
    <VChip variant="flat" class="d-flex px-1" :color="findEbitNoteStatus(item.status).colorInvoice">
      {{ findEbitNoteStatus(item.status).titleInvoice }}
    </VChip>
  </template>
  <template #action="{ item }">
    <v-btn v-if="shipmentEditable"
      @click="recordReceiptForm.setEntity(item)"
      :title="$gettext('Add Receipt Record')"
      class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
      size="x-small"
    >
      <VIcon icon="tabler-receipt" size="18"/>
    </v-btn>
    <v-btn
      @click="preview.openPreview(item)"
      :title="$gettext('preview')"
      class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
      size="x-small"
    >
      <VIcon icon="tabler-eye" size="18"/>
    </v-btn>
    <SubmitBtn 
      v-if="shipmentEditable"
      @click="deleteEbitNote(item, $refs['delete-' + item.id])"
      :title="$gettext('delete')"
      class="mx-0 px-0 ms-n2 me-n3" variant="text"
      :autoQueue="false"
      :ref="'delete-' + item.id"
      size="x-small"
    >
      <VIcon icon="tabler-trash" size="18"/>
    </SubmitBtn>
  </template>
</AppTableInline>
<AppForm
  :layout="layoutPOBO"
  :entityName="$gettext('POBO')"
  :makeDefaultEntity="defaultPOBO"
  :service="EntityService"
  :context="shipment"
  :entityPreSubmit="entityPreSubmit"
  @entitySubmitted="emit('shipmentChanged')"
  :notRemoveScrollAfterSubmit="true"
  :inputCallBack="{
      'currency': onCurrencyChanged,
      'exchangeRates': onExchangeRatesChanged,
      'chargeItems': onChargeItemsChanged,
      'moneyScale': onMoneyScaleChanged,
    }"
  ref="formPOBO"
/>
<AppForm
  :layout="layoutCOBO"
  :entityName="$gettext('COBO')"
  :makeDefaultEntity="defaultCOBO"
  :service="EntityService"
  :context="shipment"
  :entityPreSubmit="entityPreSubmit"
  @entitySubmitted="emit('shipmentChanged')"
  :notRemoveScrollAfterSubmit="true"
  :inputCallBack="{
      'currency': onCurrencyChanged,
      'exchangeRates': onExchangeRatesChanged,
      'chargeItems': onChargeItemsChanged,
      'moneyScale': onMoneyScaleChanged,
    }"
  ref="formCOBO"
/>
<EbitNotePreview ref="preview" @madeInvoice="emit('shipmentChanged')"/>
<RecordForm 
  ref="recordPaymentForm" :context="shipment"
  :layout="paymentLayout"
  :defaultEntity="paymentDefault"
  @shipmentChanged="emit('shipmentChanged')"
/>
<RecordForm 
  ref="recordReceiptForm" :context="shipment"
  :layout="receiptLayout"
  :defaultEntity="receiptDefault"
  @shipmentChanged="emit('shipmentChanged')"
/>
</template>
