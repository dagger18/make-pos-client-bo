<script setup>
import { enums as EbitNoteStatus, findByValue as getEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType, findByValue as getEbitNoteType } from '@/config/enums/EbitNoteType';
import { layout as layoutSendmail, makeDefaultEntity } from '@/config/forms/shipment/SendMail';
// EbitNoteService removed - freight-specific service
const EbitNoteService = null;
const props = defineProps({
  removeDocumentScroll: { type: Boolean, default: false }
})
const ebitNote = ref({})
const [dialog, toggleDialog] = useToggle()
function downloadPdf(language) {
  window.open(EbitNoteService.downloadPdf(ebitNote.value.id, language, ebitNote.value.shipment.id), '_blank')
}
function previewPdf(language = 'en') {
  return EbitNoteService.previewPdf(ebitNote.value.id, language, ebitNote.value.shipment.id)
}
function openPreview (e) {
  ebitNote.value = e
  toggleDialog(true)
  if(props.removeDocumentScroll) {
    document.querySelector('html').classList.add('overflow-y-hidden');
  }
}
function reset () {
  toggleDialog(false)
  if(props.removeDocumentScroll) {
    document.querySelector('html').classList.remove('overflow-y-hidden');
  }
}
defineExpose({
  openPreview
})
const emit = defineEmits(['madeInvoice'])
const status = computed(() => {
  return getEbitNoteStatus(ebitNote.value.status)
})
const formTitle = computed(() => {
  if(!ebitNote.value) return ''
  return $gettext('Preview') + ' ' + getEbitNoteType(ebitNote.value.type).title
})
const isInvoice = computed(() => {
  if(!ebitNote.value) return false
  return ebitNote.value.type === EbitNoteType.InvoiceDebit
    || ebitNote.value.type === EbitNoteType.InvoiceCredit
})
const isRecord = computed(() => {
  if(!ebitNote.value) return false
  return ebitNote.value.type === EbitNoteType.RecordReceipt
    || ebitNote.value.type === EbitNoteType.RecordPayment
})
const splitable = computed(() => {
  if(!ebitNote.value.type === EbitNoteType.Debit) return false
  const taxGroups = {};
  ebitNote.value.chargeItems.forEach(c => {
    if(c.taxGroup) {
      taxGroups[c.taxGroup.id] = true
    }
  })
  return Object.keys(taxGroups).length > 1
})
async function makeInvoice(splitByTaxGroup = false) {
  const result = await EbitNoteService.makeInvoice(ebitNote.value.id, {
    splitByTaxGroup,
    parentId: ebitNote.value.shipment.id,
    parentType: 'shipment',
    parentProperty: 'ebitNote'
  })
  reset()
  emit('madeInvoice')
}
</script>
<template>
<div class="form-dialog" v-if="dialog">
  <VCard
    class="form-title mx-4"
    :title="formTitle"
  >
    <template #append>
      <div class="form-close d-flex me-n4">
        <v-btn variant="text" size="small" @click="reset" color="primary">
          <VIcon icon="tabler-x" size="30" />
        </v-btn>
      </div>
    </template>
  </VCard>
  <VRow 
    class="px-4 flex-nowrap pt-4"
  >
    <VCol cols="12" lg="3" order-lg="1" style="max-inline-size: 250px;" class="ms-n3">
      <VCard>
        <VCardText>
          <template v-if="isInvoice">
            <VBtn 
              variant="outlined" label block :color="status.colorInvoice" class="mb-2 px-2 justify-end">
              <span class="d-flex flex-grow-1 me-2">{{ $gettext('Status') }}</span> 
              <VChip label class="text-uppercase text-center" style="inline-size: 120px">{{ status.titleInvoice }}</VChip>
            </VBtn>
          </template>
          <template v-else-if="!isRecord">
            <VBtn 
              variant="outlined" label block :color="status.color" class="mb-2 px-2 justify-end">
              <span class="d-flex flex-grow-1 me-2">{{ $gettext('Status') }}</span> 
              <VChip label class="text-uppercase text-center" style="inline-size: 120px">{{ status.title }}</VChip>
            </VBtn>
            <template 
              v-if="status.value === EbitNoteStatus.Pending
                    || status.value === EbitNoteStatus.Sent
                    " 
            >
              <VBtn 
                @click="makeInvoice()" 
                block class="mb-2 d-flex" color="success"
                v-if="!splitable"
              >
                <VIcon icon="tabler-file-invoice" size="24" class="me-4 ms-n7"/>
                {{ $gettext('Make Invoice') }}
              </VBtn>
              <VMenu v-else>
                <template #activator="{ props }">
                  <VBtn v-bind="props" block class="mb-2 d-flex" color="success">
                    <VIcon icon="tabler-file-invoice" size="24" class="me-4 ms-n7"/>
                    {{ $gettext('Make Invoice') }}
                  </VBtn>
                </template>
                <VList>
                  <VListItem @click="makeInvoice()">
                    <VListItemTitle>{{ $gettext('Not split invoice') }}</VListItemTitle>
                  </VListItem>
                  <VListItem @click="makeInvoice(true)">
                    <VListItemTitle>{{ $gettext('Split by tax group') }}</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
              <DialogForm
                :apiService="{add: EbitNoteService.sendMail}"
                :modelValue="makeDefaultEntity(ebitNote)" 
                :layout="layoutSendmail"
                @entitySubmitted="emit('madeInvoice')"
              >
                <template #activator="props">
                  <VBtn 
                    block class="mb-2 d-flex" 
                    variant="tonal" color="secondary" 
                    v-bind="props"
                  >
                    <VIcon icon="tabler-mail-dollar" size="24" class="me-4 ms-n10" />
                    {{ $gettext('Send Email') }}
                  </VBtn>
                </template>
              </DialogForm>
              
            </template>
          </template>
          
          <VMenu>
            <template #activator="{ props }">
              <VBtn v-bind="props" block class="mb-2 d-flex" variant="tonal" color="secondary">
                <VIcon icon="tabler-file-download" size="24" class="me-4 ms-n4"/>
                {{ $gettext('Download PDF') }}
              </VBtn>
            </template>
            <VList>
              <VListItem @click="downloadPdf('en')">
                <VListItemTitle>English</VListItemTitle>
              </VListItem>
              <VListItem @click="downloadPdf('vi')">
                <VListItemTitle>Vietnamese</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
          
          <VBtn block class="mb-2 d-flex" variant="tonal" color="secondary">
            <VIcon icon="tabler-printer" size="24" class="me-4 ms-n15" />
            {{ $gettext('Print A4') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" lg="auto">
      <VCard class="A4Iframe">
        <VCardText>
          <iframe 
            :src="previewPdf()" 
            class="w-100"
            style="overflow: hidden;border: none;block-size: 30.7cm;"
          ></iframe>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</div>
</template>
