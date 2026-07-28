<script setup>
import { getTitle as getFreightTermTitle } from '@/config/enums/FreightTerm';
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { enums as TransportType } from '@/config/enums/TransportType';
import { enums as VolumeType } from '@/config/enums/VolumeType';
// BookingService removed - freight-specific service
const BookingService = null;
import { printDate, printDateTime, printPort } from '@/services/CommonService';
import { $gettext } from '@/utils/api';
import { useDisplay } from 'vuetify';
import BookingForm from './BookingForm.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
const { mdAndDown } = useDisplay()
const generals = computed(() => {
  const booking = props.shipment?.booking
  if(!booking) return []
  return [
    [
      { title: $gettext('Booking No.'), value: booking.code ?? '...' },
      { title: $gettext('Booking Date'), value: booking.bookingDate ? printDate(booking.bookingDate) : '...' },
    ],
    [
      { title: $gettext('Booking Number Reference'), value: booking.codeReference ?? '...' },
      { 
        title: $gettext('Booking To'), 
        value: booking.bookingTo ?? '...'
      },
    ],
    [
      { title: $gettext('Booking Note'), value: booking.note ?? '...'},
    ]
  ]
})
const originRows = computed(() => {
  const booking = props.shipment?.booking
  if(!booking) return []
  const transportType = props.shipment.quote.transportType
  const quote = props.shipment.quote
  let config = []
  switch(transportType) {
    case TransportType.AIR:
      config = [
        [
          { title: $gettext('Place of Receipt'), value: booking.placeReceipt },
          { title: $gettext('Air-port of Loading'), value: printPort(booking.portLoading) },
        ],
        [
          { title: $gettext('Pick up'), value: booking.pickup },
          { title: $gettext('ETD'), value: printDateTime(booking.etd) },
        ],
        [
          { title: $gettext('Flight No.'), value: booking.vesselNo },
          { title: $gettext('Drop off / Warehouse'), value: booking.warehouse },
        ],
        [
          { title: $gettext('Provider'), value: quote.provider.name },
          { title: $gettext('Airline'), value: quote.carrier?.name },
        ]
      ];
      break;
    case TransportType.Ocean:
    case TransportType.Multimodal:
      config = [
        [
          { title: $gettext('Place of Receipt'), value: booking.placeReceipt },
          { title: $gettext('Port of Loading'), value: printPort(booking.portLoading) },
        ],
        [
          { title: $gettext('Pick up'), value: booking.pickup },
          { title: $gettext('ETD'), value: printDateTime(booking.etd) },
        ],
        [
          { title: $gettext('Date of Pick up'), value: printDateTime(booking.pickupDate) },
          { title: $gettext('Drop off / Warehouse'), value: booking.warehouse },
        ],
        [
          { title: $gettext('Feeder Vessel'), value: booking.feederVessel },
          { title: $gettext('Feeder Voyage'), value: booking.feederVoyage },
        ],
        [
          { title: $gettext('Mother Vessel'), value: booking.motherVessel },
          { title: $gettext('Mother Voyage'), value: booking.motherVoyage },
        ],
        [
          { title: $gettext('Provider'), value: quote.provider.name },
          { title: $gettext('Carrier'), value: quote.carrier?.name },
        ],
        ...(quote.serviceType === 'LCL' ? [
          [
            { title: $gettext('Place Stuffing'), value: booking.placeStuffing },
            { title: $gettext('Date Stuffing'), value: printDate(booking.dateStuffing) },
          ]
        ]: [])
      ];
      break;
  }
  return [
    ...config,
    [
      { title: $gettext('CY Cut-off'), value: printDateTime(booking.cyCutOff) },
      { title: $gettext('SI Cut-off'), value: printDateTime(booking.siCutOff) },
    ],
    [
      { title: $gettext('VGM Cut-off'), value: printDateTime(booking.vgmCutOff) },
      { title: $gettext('Gate In'), value: printDateTime(booking.gateIn) },
    ],
    [
      { title: $gettext('Temp'), value: booking.temperature },
      { title: $gettext('Vent'), value: booking.vent },
    ],
    [
      { 
        title: $gettext('Freight Terms'), 
        value: booking.freightTerms ? getFreightTermTitle(booking.freightTerms) : '...' 
      }
    ]
  ]
})
const destinationRows = computed(() => {
  const booking = props.shipment?.booking
  if(!booking) return []
  const transportType = props.shipment.quote.transportType
  return [
    [
      { 
        title: transportType === TransportType.AIR 
                ? $gettext('Air-port of Discharge')
                : $gettext('Port of Discharge'), 
        value: printPort(booking.portDischarge) },
      { title: $gettext('Place of Delivery'), value:booking.placeDelivery },
    ],
    [
      { title: $gettext('Final destination'), value: booking.destination },
      { title: $gettext('ETA'), value: printDateTime(booking.eta) },
    ]
  ]
})
const volumeRows = computed(() => {
  const quote = props.shipment?.quote
  const booking = props.shipment?.booking
  if(!quote) return []
  return [
    [
      (quote.cargoVolumeType === VolumeType.Container
        || quote.transportType === TransportType.Multimodal)
      ? { 
          title: $gettext('Volume'), 
          value: booking.cargoVolume.totalUnit
        } 
      : { title: $gettext('No. of package(s)'), value: booking.cargoVolume.totalUnit },
      { title: $gettext('Commodity'), value: quote.commodities },
    ],
    [
      { title: $gettext('Gross Weight (KGS)'), value: quote.cargoVolume.totalWeight ?? booking.cargoVolume.totalWeight },
      { 
        title: $gettext('Measurement (CBM)'), 
        value: (booking.cargoVolume.totalCBM && booking.cargoVolume.totalCBM !== '') 
                ? booking.cargoVolume.totalCBM
                : quote.cargoVolume.totalCBM 
      },
    ]
  ]
})
const otherRows = computed(() => {
  const booking = props.shipment?.booking
  if(!booking) return []
  const transportType = props.shipment.quote.transportType
  switch(transportType) {
    case TransportType.AIR:
      return [
      [
        { title: $gettext('Contact No.'), value: booking.contactNumber },
        { title: $gettext('Date of Creation'), value: printDate(booking.contactDate) },
      ]
    ]
    case TransportType.Multimodal:
    case TransportType.Ocean:
      if(props.shipment.quote.serviceType !== 'LCL') {
        return [
        [
          { title: $gettext('Contact'), value: booking.contactNumber },
          { title: $gettext('Date of Creation'), value: printDate(booking.contactDate) },
        ],
        [
          { title: $gettext('Special Remark'), value: booking.remark },
        ]
      ]
      }
      return [
      [
        { title: $gettext('Contact at warehouse'), value: booking.contactNumber },
        { title: $gettext('Code at warehouse'), value: booking.codeWarehouse },
      ],
      [
        { title: $gettext('Special Remark'), value: booking.remark },
        { title: $gettext('Date of Creation'), value: printDate(booking.contactDate) },
      ]
    ]
  }
  return []
})
const bookingForm = ref(null)
function entitySubmitted(data) {
  props.shipment.booking = data
}
function downloadPdf(language) {
  window.open(BookingService.downloadPdf(props.shipment, language), '_blank')
}
const shipmentEditable = computed(() => {
  return props.shipment 
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
</script>
<template>
  <div>
<VRow v-if="shipment" class="mt-2">
  <VCol v-for="col in generals" cols="12" lg="3">
    <VSheet :min-height="mdAndDown ? 0 : 57">
      <div class="text-disabled font-weight-bold">
        {{ col[0].title }}
      </div>
      <div>{{ col[0].value }}</div>
    </VSheet>
    <div 
      class="mt-1 text-disabled font-weight-bold" 
      v-if="col[1]"
    >{{ col[1].title }}</div>
    <div v-if="col[1]">{{ col[1].value }}</div>
  </VCol>
  <VCol >
    <div class="d-flex flex-column align-end ms-auto">
      <VBtn 
        class="mb-2" size="small" min-width="200" 
        v-if="$can('MANAGE_Booking', 'Shipment') && shipmentEditable"
        @click="bookingForm.setEntity(shipment.booking)"
      >
        <VIcon icon="tabler-edit" size="20" class="me-2"/>{{ $gettext('Edit Booking') }}
      </VBtn>
      <VMenu v-if="$can('MANAGE_Booking', 'Shipment')">
        <template #activator="{ props }">
          <VBtn v-bind="props"
            variant="tonal" size="small" color="secondary" min-width="200" class="pe-2"
          >
            <VIcon icon="tabler-file-download"  size="21" class=" ms-n3 me-1"/>
              {{ $gettext('Download Confirmation') }}
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
      
    </div>
  </VCol>
</VRow>
<VRow>
  <VCol cols="12" lg="6">
    <div class="font-weight-bold pb-3 text-uppercase">{{ $gettext('Origin') }}</div>
    <VRow v-for="row in originRows">
      <VCol cols="6" class="pt-0 pb-5" v-for="col in row">
        <div class="text-disabled font-weight-bold">
          {{ col.title }}
        </div>
        <div>{{ col.value ? col.value : '...' }}</div>
      </VCol>
    </VRow>
    <div class="font-weight-bold pt-3 text-uppercase">
      {{ $gettext('Terms and Conditions') }}
    </div>
    {{ shipment.booking?.terms ?? '...' }}
  </VCol>
  <VCol cols="12" lg="6">
    <div class="font-weight-bold pb-3 text-uppercase">{{ $gettext('Destination') }}</div>
    <VRow v-for="row in destinationRows">
      <VCol cols="6" class="pt-0 pb-5" v-for="col in row">
        <div class="text-disabled font-weight-bold">{{ col.title }}</div>
        <div>{{ col.value ? col.value : '...' }}</div>
      </VCol>
    </VRow>
    <div class="font-weight-bold py-3 text-uppercase">{{ $gettext('Booking Consignment') }}</div>
    <VRow v-for="row in volumeRows">
      <VCol cols="6" class="pt-0 pb-5" v-for="col in row">
        <div class="text-disabled font-weight-bold">{{ col.title }}</div>
        <div>{{ col.value ? col.value : '...' }}</div>
      </VCol>
    </VRow>
    <div class="font-weight-bold py-3 text-uppercase">{{ $gettext('Other Information') }}</div>
    <VRow v-for="row in otherRows">
      <VCol cols="6" class="pt-0 pb-5" v-for="col in row">
        <div class="text-disabled font-weight-bold">{{ col.title }}</div>
        <div>{{ col.value ? col.value : '...' }}</div>
      </VCol>
    </VRow>
    <div class="font-weight-bold py-3 text-uppercase">{{ $gettext('Transit Ports') }}</div>
  </VCol>
</VRow>
<BookingForm 
  v-if="shipment"
  ref="bookingForm"
  :parentBind="{
    parentType: 'shipment', 
    parentId: shipment.id, 
    parentProperty: 'booking'
  }"
  :shipment="shipment"
  @entitySubmitted="entitySubmitted"
/>
</div>
</template>
