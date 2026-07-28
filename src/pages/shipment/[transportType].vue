<script setup>
import VolumeItems from '@/components/common/VolumeItems.vue';
import { findByValue as findEbitNoteStatus } from '@/config/enums/EbitNoteStatus';
import { enums as EbitNoteType, getTitle as getEbitNoteTitle } from '@/config/enums/EbitNoteType';
import { enums as ShipmentStatus, findByValue as findShipmentStatus } from '@/config/enums/ShipmentStatus';
import { findByValue as findSubStatus } from '@/config/enums/SubStatus';
import { getList as TransportTypes, findByValue, slugToValue } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/shipment/Shipment';
import { printDateTime } from '@/services/CommonService';
import EntityService from '@/services/ShipmentService';
import { useAppStore } from '@/stores/appStore';
import { $gettext } from '@/utils/api';
import QuoteForm from '@/views/quote/QuoteForm.vue';
import ShipmentDetail from '@/views/shipment/ShipmentDetail.vue';
import { can } from '@layouts/plugins/casl';
definePage({ 
  meta: { action: 'GET', subject: 'Shipment' },
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const detail = ref(null)
const currentTransportType = ref(route.params.transportType === 'all' ? 'all' : slugToValue(route.params.transportType))
const buttons = computed(() => {
  return can('POST', 'Shipment') ? [
     {
      text: $gettext('Add Shipment'),
      func: form.value?.setEntity
    }
  ] : []
})
const apiCallParam = computed(() => {
  if(currentTransportType.value === 'all') return {}
  return {'has_quote_transportType': currentTransportType.value}
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
watch(() => route, () => {
  if(route.name !== 'shipment-transport-type') return
  currentTransportType.value = route.params.transportType === 'all' ? 'all' : slugToValue(route.params.transportType)
  nextTick(() => {
    table.value?.fetchData()
  })
}, {
  deep: true
})
function ebitNotes(ebitNotes) {
  if(ebitNotes.length === 0) return []
  const noteMap = {}
  const noteTypes = [EbitNoteType.Debit, EbitNoteType.Credit]
  ebitNotes
    .filter(n => noteTypes.includes(n.type))
    .forEach(note => {
    if(!noteMap.hasOwnProperty(note.type)) {
      noteMap[note.type] = {}
    }
    if(!noteMap[note.type].hasOwnProperty(note.status)) {
      noteMap[note.type][note.status] = 0
    }
    noteMap[note.type][note.status] += 1
  })
  return noteTypes.map(type => {
    if(!noteMap[type]) return null
    return {
      title: getEbitNoteTitle(type),
      items: Object.keys(noteMap[type])
              .map(status => {
                return {
                  title: findEbitNoteStatus(status).title, 
                  counter: noteMap[type][status],
                  color: findEbitNoteStatus(status).color
                }
              })
    }
  }).filter(e => e)
}
async function replicateShipment(shipment, buttonComponent) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to replicate shipment %{code}? New shipment will have status "Draft".', {code: shipment.code ?? ''}),
    { color: 'warning' }
  )
  if (!confirmed) {
    buttonComponent.disabled = false
    return
  }
  buttonComponent.addToQueuingList()
  const result = await EntityService.replicate(shipment.id);
  if(!result.error) {
    table.value.fetchData()
  }
}
function copyText(string) {
  const stripedText = string.replace(/(<([^>]+)>)/ig, '')
  navigator.clipboard.writeText(stripedText);
  useAppStore().pushErrorMessage({
    success: true,
    detail: $gettext('Copied to clipboard')
  })
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :apiCallParam="apiCallParam"
    :pageTitle="$gettext('Shipments')"
    :sortBy="'createdDate'"
  >
    <template v-slot:beforeTable>
      <BtnSelectGroup  class="mt-4 mb-2"
        :modelValue="route.params.transportType"
        :valueKey="'slug'" variant="outlined"
        @update:modelValue="$router.push({ 
          name: 'shipment-transport-type', 
          params: {
            transportType: $event
          } 
        })"
        :items="[
          {
            title: $gettext('All'), slug: 'all', icon: 'tabler-package-export', iconSize: 21
          },
          ...TransportTypes
        ]" 
      />
    </template>
    <template #code="{item}">
      <div :class="[item.code ? '' : 'text-disabled']">
        <VIcon :icon="findByValue(item.transportType).icon" size="15" class="mt-n1 me-2"/>
        <b>{{ item.code ?? ('Temp code: #' + item.id) }}</b>
      </div>
      <div class="d-flex">
        <VIcon 
          icon="tabler-alarm" class="ms-n1 text-disabled" 
          v-if="item.isTimingGood"
        />
        <TooltipMenu 
          :skidding="-12"
          v-else placement="top-start" >
          <VIcon icon="tabler-alarm" class="text-error rise-shake cursor-pointer"/>
          <template #popper>
            <div class="pa-2 text-error">
              <div v-for="([days, dateValue], index) in item.timeAlerts">
                {{ $gettext('The shipment is now approaching %{timeCriteria} date', {timeCriteria: index.toUpperCase()}) }}
                ({{ printDateTime(dateValue) }}) - {{ days }} {{ $gettext('day(s) left') }}
              </div>
            </div>
          </template>
        </TooltipMenu>
        <VIcon 
          icon="tabler-file-alert" size="19" class="text-disabled"
          v-if="item.isDocumentUploaded"
        />
        <TooltipMenu 
          :skidding="-12"
          v-else placement="top-start" >
          <VIcon icon="tabler-file-alert" size="19" class="text-error rise-shake cursor-pointer"/>
          <template #popper>
            <div class="pa-2 text-error">{{ $gettext('No MAWB uploaded yet (Please go to document tab of shipment to upload)') }}</div>
          </template>
        </TooltipMenu>

        <VIcon 
          icon="tabler-receipt-dollar" size="19" class="text-disabled"
          v-if="item.isProfitMet"
        />
        <TooltipMenu 
          :skidding="-12"
          v-else placement="top-start" >
          <VIcon icon="tabler-receipt-dollar" size="19" class="text-error rise-shake cursor-pointer"/>
          <template #popper>
            <div class="pa-2 text-error">{{ $gettext('Total profit is less than minimum profit') }}</div>
          </template>
        </TooltipMenu>

        <div>{{ item.shipmentMode }}</div>

      </div>
    </template>
    <template #cargoVolume="{item}">
      <VolumeItems v-bind="item" />
    </template>
    <template #billNo="{item}">
      <VChip label variant="tonal" color="secondary" size="small" class="d-flex px-2 mb-1 text-left" v-if="item.masterBill">
        M: {{ item.masterBill }}
      </VChip>
      <VChip label variant="tonal" color="secondary" size="small" class="d-flex px-2 text-left" v-if="item.houseBill">
        H: {{ item.houseBill }}
      </VChip>
    </template>
    <template #booking="{item}">
      <VChip label variant="tonal" color="secondary" size="small" class="d-flex px-2 mb-1 text-left" v-if="item.booking.code">
        No.: <b>{{ item.booking.code }}</b>
      </VChip>
      <VChip label variant="tonal" color="secondary" size="small" class="d-flex px-2 text-left" v-if="item.booking.codeReference">
        Ref: <b>{{ item.booking.codeReference }}</b>
      </VChip>
    </template>
    <template #route="{item}">
      <div class="position-relative d-flex">
        <span class="d-inline-block text-warning">
          {{ item.quote.originPort?.codeFull }}&nbsp;·&nbsp;
        </span> 
        <span
            class="d-inline-block text-truncate"
            style="max-inline-size: 90px;"
            :title="item.quote.originPort?.name"
            @click="copyText(item.quote.originPort?.name)"
          >{{ item.quote.originPort?.name }}</span>
        <VIcon 
          icon="tabler-arrow-move-down" size="28" color="warning"
          style="
            position: absolute;
            inset-block-start: 5px;
            inset-inline-start: -21px;
          "
          />
      </div>
      <div class="position-relative d-flex">
        <span class="d-inline-block text-warning">
          {{ item.quote.destinationPort?.codeFull }}&nbsp;·&nbsp;
        </span> 
        <span 
            class="d-inline-block text-truncate"
            style="max-inline-size: 90px;"
            :title="item.quote.destinationPort?.name"
            @click="copyText(item.quote.destinationPort?.name)"
          >
            {{ item.quote.destinationPort?.name }}
          </span>
      </div>
    </template>
    <template #etdeta="{item}">
      <div class="position-relative">
        {{ printDateTime(item.booking.etd) ?? $gettext('ETD unknown') + '...' }}
      </div>
      {{ printDateTime(item.booking.eta) ?? $gettext('ETA unknown') + '...' }}
    </template>
    <template #status="{item}">
      <VChip class="d-flex" :color="item.isOnHold ? 'error' : findShipmentStatus(item.status).color">
        {{ item.isOnHold ? $gettext('On Hold') : findShipmentStatus(item.status).title }}
      </VChip>
      <div v-if="item.subStatus" class="text-caption text-medium-emphasis text-center mt-1">
        {{ findSubStatus(item.subStatus)?.title ?? item.subStatus }}
      </div>
    </template>
    <template #voucher="{item}">
      <div v-for="noteType in ebitNotes(item.ebitNotes)" class="mb-1">
        <span class="d-inline-block" style="inline-size: 10px;">{{ noteType.title[0] }}</span>:
        <template v-for="noteStatus in noteType.items">
          <VChip :color="noteStatus.color">
            {{ noteStatus.counter }} {{ noteStatus.title }} 
          </VChip>
        </template>
      </div>
    </template>
    <template #action="{ item }">
      <div class="mx-2">
      <SubmitBtn
        v-if="item.status !== ShipmentStatus.Completed"
        @click="table.handleDelete(item, $refs['delete-' + item.id])"
        :title="$gettext('Delete Shipment')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        :autoQueue="false"
        :ref="'delete-' + item.id"
        size="x-small"
      >
        <VIcon icon="tabler-trash" size="18"/>
      </SubmitBtn>
      <v-btn
        @click="detail.setEntity(item.code ?? item.id)"
        :title="$gettext('View Detail')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        size="x-small"
      >
        <VIcon icon="tabler-eye" size="18"/>
      </v-btn>
      <SubmitBtn
        v-if="$can('POST', 'Shipment')"
        @click="replicateShipment(item, $refs['replicate-' + item.id])"
        :title="$gettext('Replicate Shipment')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        :ref="'replicate-' + item.id"
        :autoQueue="false"
        size="x-small"
      >
        <VIcon icon="tabler-copy-plus" size="18"/>
      </SubmitBtn>
      </div>
    </template>
  </AppTable>
  <QuoteForm 
    ref="form" 
    :currentTransportType="currentTransportType"
    @entitySubmitted="table.fetchData()"
    :makeShipment="true"
  />
  <ShipmentDetail
    ref="detail"
    isDialog pushUrl
    @closed="table.fetchData(true)"
  />
</template>
