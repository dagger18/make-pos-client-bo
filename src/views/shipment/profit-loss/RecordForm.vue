<script setup>
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { dateAdapter } from "@/plugins/vuetify";
import { dayJSToUTC, transformPreSubmit } from '@/services/CommonService';
import EntityService from '@/services/EbitNoteService';
const form = ref(null)
const props = defineProps({
  context: {type: Object, default: () => {}},
  layout: {type: Function},
  defaultEntity: {type: Function},
})

async function setEntity(invoice) {
  const rawInvoice = JSON.parse(JSON.stringify(toRaw(invoice)))
  
  delete rawInvoice.code
  delete rawInvoice.chargeItems
  delete rawInvoice.documents
  delete rawInvoice.pdfs
  delete rawInvoice.dueDate
  delete rawInvoice.amountNoTax
  delete rawInvoice.tax
  delete rawInvoice.createdDate
  delete rawInvoice.updatedDate
  rawInvoice.type = (rawInvoice.type === EbitNoteType.InvoiceDebit 
                      || rawInvoice.type === EbitNoteType.COBO
                    )
                    ? EbitNoteType.RecordReceipt 
                    : EbitNoteType.RecordPayment
  rawInvoice.parentNote = rawInvoice.id
  delete rawInvoice.id
  rawInvoice.noteDate = dayJSToUTC(dateAdapter.date())
  rawInvoice.dueDate = dayJSToUTC(dateAdapter.date())
  rawInvoice.amount.amount = rawInvoice.remains
  rawInvoice.amountInWords = (await EntityService.getAmountInWords(rawInvoice.currency, (rawInvoice.amount.amount * 100).round(0))).words
  console.log(rawInvoice)
  form.value.setEntity(rawInvoice)
}
defineExpose({
  setEntity
})
const emit = defineEmits(['shipmentChanged'])
function entityPreSubmit (reactedEntity) {
  let entity = reactedEntity
  
  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
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
  entity.parentId = props.context.id
  entity.parentType = 'shipment'
  entity.parentProperty = 'ebitNote'
  console.log('final object', JSON.parse(JSON.stringify(entity)))

  return entity
}
let amountInWordsTimeout = null
function onAmountChanged(entity, columns, value) {
  clearTimeout(amountInWordsTimeout)
  amountInWordsTimeout = setTimeout(async () => {
    entity.amountInWords = (await EntityService.getAmountInWords(entity.currency, (entity.amount.amount * 100).round(0))).words
  }, 1000)
  
}
</script>
<template>
  <AppForm
  :layout="layout"
  :entityName="$gettext('Record')"
  :makeDefaultEntity="defaultEntity"
  :service="EntityService"
  :context="context"
  :entityPreSubmit="entityPreSubmit"
  @entitySubmitted="emit('shipmentChanged')"
  :notRemoveScrollAfterSubmit="true"
  ref="form"
  :inputCallBack="{
    'amount': onAmountChanged,
  }"
/>
</template>
