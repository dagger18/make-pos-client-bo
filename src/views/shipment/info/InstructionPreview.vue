<script setup>
import { enums as TransportType } from '@/config/enums/TransportType'
// InstructionService removed - freight-specific service
const InstructionService = null;
const props = defineProps({
  isDialog: {type: Boolean, default: false},
  shipment: {type: Object, default: () => {}}
})
const [loading, toggleLoading] = useToggle()
const instruction = ref(null)
async function setEntity (instructionId) {
  toggleLoading()
  if(instructionId.id) {
    instruction.value = instructionId
  } else {
    instruction.value = await InstructionService.get(instructionId)
  }
  toggleLoading()
  if(!props.isDialog) return
  document.querySelector('html').classList.add('overflow-y-hidden');
  history.pushState(
    {},
    null,
    '/instruction/preview/' + instruction.value.id
  )
}

defineExpose({
  setEntity
})

const isAir = computed(() => props.shipment?.quote?.transportType === TransportType.AIR)

function downloadHblPdf(language) {
  window.open(InstructionService.downloadPdf(props.shipment, language), '_blank')
}
function downloadHawbPdf(language) {
  window.open(InstructionService.downloadHawbPdf(props.shipment, language), '_blank')
}
function downloadPackingListPdf(language) {
  window.open(InstructionService.downloadPackingListPdf(props.shipment, language), '_blank')
}
function previewPdf(language = 'en') {
  return InstructionService.previewPdf(instruction.value.id, language, props.shipment.id)
}
onMounted(() => {
  setEntity(props.shipment.instruction)
})
</script>
<template>
<div :class="{'form-dialog': isDialog}" v-show="instruction">
  <VRow
    class="pt-4 flex-nowrap"
    :class="{'px-4': isDialog}"
  >
    <VCol cols="12" lg="3" order-lg="1" style="max-inline-size: 250px;" :class="{'ms-n3': isDialog}">
      <VCard v-if="instruction" :elevation="isDialog ? '' : 0">
        <VCardText class="mt-n3">
          <!-- Ocean: HBL download -->
          <VMenu v-if="!isAir">
            <template #activator="{ props }">
              <VBtn v-bind="props" block class="mb-2 d-flex" variant="tonal" color="secondary">
                <VIcon icon="tabler-file-download" size="24" class="me-4 ms-n4"/>
                {{ $gettext('Download HBL') }}
              </VBtn>
            </template>
            <VList>
              <VListItem @click="downloadHblPdf('en')">
                <VListItemTitle>English</VListItemTitle>
              </VListItem>
              <VListItem @click="downloadHblPdf('vi')">
                <VListItemTitle>Vietnamese</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>

          <!-- Air: HAWB download -->
          <VMenu v-if="isAir">
            <template #activator="{ props }">
              <VBtn v-bind="props" block class="mb-2 d-flex" variant="tonal" color="secondary">
                <VIcon icon="tabler-file-download" size="24" class="me-4 ms-n4"/>
                {{ $gettext('Download HAWB') }}
              </VBtn>
            </template>
            <VList>
              <VListItem @click="downloadHawbPdf('en')">
                <VListItemTitle>English</VListItemTitle>
              </VListItem>
              <VListItem @click="downloadHawbPdf('vi')">
                <VListItemTitle>Vietnamese</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>

          <!-- Packing List (all transport types) -->
          <VMenu>
            <template #activator="{ props }">
              <VBtn v-bind="props" block class="mb-2 d-flex" variant="tonal" color="secondary">
                <VIcon icon="tabler-list" size="24" class="me-4 ms-n4"/>
                {{ $gettext('Download Packing List') }}
              </VBtn>
            </template>
            <VList>
              <VListItem @click="downloadPackingListPdf('en')">
                <VListItemTitle>English</VListItemTitle>
              </VListItem>
              <VListItem @click="downloadPackingListPdf('vi')">
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
            v-if="instruction"
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
