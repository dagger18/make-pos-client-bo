<script setup>
import { findByValue as getQuoteStatus } from '@/config/enums/QuoteStatus';
import { findByValue } from '@/config/enums/TransportType';
import { router } from '@/plugins/1.router';
// QuoteService removed - freight-specific service
const QuoteService = null;
const props = defineProps({
  isDialog: {type: Boolean, default: true}
})
const [loading, toggleLoading] = useToggle()
const quote = ref(null)
let preQuoteUrl = null
async function setEntity (quoteId) {
  toggleLoading()
  if(quoteId.id) {
    quote.value = quoteId
  } else {
    quote.value = await QuoteService.get(quoteId)
  }
  toggleLoading()
  if(!props.isDialog) return
  document.querySelector('html').classList.add('overflow-y-hidden');
  preQuoteUrl = window.location.pathname + window.location.search + window.location.hash
  history.pushState(
    {},
    null,
    router.resolve({ name: 'quote-preview-id', params: { id: quote.value.id } }).href
  )
}
const emit = defineEmits(['closed', 'openUpdate'])
function reset () {
  const backRoute = router.resolve({ name: 'quote-transport-type', params: { transportType: findByValue(quote.value.transportType).slug } }).href
  document.querySelector('html').classList.remove('overflow-y-hidden');
  quote.value = null
  emit('closed', backRoute)
  history.pushState(
    {},
    null,
    preQuoteUrl ?? backRoute
  )
  preQuoteUrl = null
}
defineExpose({
  setEntity
})

function downloadPdf(language) {
  window.open(QuoteService.downloadPdf(quote.value.id, language), '_blank')
}
function openUpdate() {
  emit('openUpdate', toRaw(quote.value))
  quote.value = null
}

async function makeShipment() {
  const result = await QuoteService.makeShipment(quote.value.id)
  if(result.id) {
    router.push({name: 'shipment-id-tab1?tab2?', params: {id: result.id}})
  }
}
const status = computed(() => {
  return getQuoteStatus(quote.value.status)
})
function previewPdf(language = 'en') {
  return QuoteService.previewPdf(quote.value.id, language)
}
</script>
<template>
<div :class="{'form-dialog': isDialog}" v-show="quote">
  <VCard
    class="form-title mx-4"
    v-if="quote && isDialog"
    :loading="loading" 
    :title="$gettext('Preview Quote')"
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
    class="pt-4 flex-nowrap" 
    :class="{'px-4': isDialog}"
  >
    <VCol cols="12" lg="3" order-lg="1" style="max-inline-size: 250px;" :class="{'ms-n3': isDialog}">
      <VCard v-if="quote" :elevation="isDialog ? '' : 0">
        <VCardText v-if="isDialog">
          <VBtn 
            variant="outlined" label block :color="status.color" class="mb-2 px-2 justify-end">
            <span class="d-flex flex-grow-1 me-2">Status</span> 
            <VChip label class="text-uppercase text-center" style="inline-size: 120px">{{ status.title }}</VChip>
          </VBtn>
          <VBtn 
            block class="mb-2 d-flex" 
            color="primary" 
            v-if="$can('PUT', 'Quote') && !quote.shipment" 
            @click="openUpdate"
          >
            <VIcon icon="tabler-pencil" size="24" class="me-4 ms-n10" />
            {{ $gettext('Edit Quote') }}
          </VBtn>
          <VBtn 
            block class="mb-2 d-flex"  color="warning" 
            v-if="quote.shipment" 
            :to="{name: 'shipment-id-tab1?tab2?', params: {id: quote.shipment.id}}"
          >
            <VIcon icon="tabler-eye" size="22" class="me-4"/>
            {{ $gettext('View Shipment') }}
          </VBtn>
          <SubmitBtn 
            block class="mb-2 d-flex"  color="warning" 
            v-else-if="$can('POST', 'Shipment')" 
            @click="makeShipment"
          >
            <VIcon icon="tabler-plane-departure" size="22" class="me-4"/>
            {{ $gettext('Create Shipment') }}
          </SubmitBtn>
        </VCardText>
        <VCardText class="mt-n3">
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
            v-if="quote"
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
<style type="scss">
.v-card.A4 {
  display: block;
  box-sizing: border-box;
  background: white;
  inline-size: 21cm;
  margin-block: 0;
  margin-block-end: 0.5cm;
  margin-inline: auto;
  max-inline-size: 100%;
  padding-block: 10px;
  padding-inline: 25px;

  .v-card-text {
    font-size: 14px;
  }

  .divider {
    opacity: 0.5 !important;
  }

  .bolder {
    font-size: 13px;
    font-weight: bold;
    margin-block-end: 0.5rem;
    text-transform: uppercase;

    &.miner {
      min-block-size: 42px;
    }
  }
}
</style>
