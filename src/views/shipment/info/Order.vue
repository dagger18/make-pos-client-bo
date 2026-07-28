<script setup>
import { getTitle as getFreightTermTitle } from '@/config/enums/FreightTerm';
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { getTitle as shipmentTypeTitle } from '@/config/enums/ShipmentType';
import { getCarrierTitle, enums as TransportType } from '@/config/enums/TransportType';
import { printDate, printPersonName, printPort } from '@/services/CommonService';
import ShipmentService from '@/services/ShipmentService';
import DangerousGoodsPanel from '../DangerousGoodsPanel.vue';
import TruckPanel from '../TruckPanel.vue';
import RailBookingPanel from '../RailBookingPanel.vue';
import ParcelPanel from '../ParcelPanel.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
const emit = defineEmits(['shipmentChanged'])
const shipmentEditable = computed(() => {
  return props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
async function saveSalesRep(user) {
  await ShipmentService.update({ id: props.shipment.id, salesRep: user })
  emit('shipmentChanged')
}
</script>
<template>
<VRow class="pt-2" v-if="props.shipment">
<VCol class="pt-4">
  <table class="table-stripe">
    <tbody>
      <tr>
        <td class="pe-6 py-1 font-weight-medium">
          {{ $gettext('Shipment ID') }}:
        </td>
        <td class="py-1">
          {{ shipment.code ??  (shipment.code ?? (shipment.id + '&nbsp;(' + $gettext('Draft') + ')')) }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium">
          {{ $gettext('Shipment Type') }}:
        </td>
        <td class="py-1">
          {{ shipmentTypeTitle(shipment.quote.shipmentType) }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Provider') }}:
        </td>
        <td class="py-1">
          {{ shipment.quote.provider.name }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ getCarrierTitle(shipment.quote.transportType) }}:
        </td>
        <td class="py-1">
          {{ shipment.quote.carrier?.name ?? '...' }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ shipment.quote.transportType === TransportType.AIR 
            ? $gettext('Air-port of loading') 
            : $gettext('Port of loading') 
          }}:
        </td>
        <td class="py-1">
          {{ printPort(shipment.quote.originPort) }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Transit port') }}:
        </td>
        <td class="py-1">
          {{ shipment.quote.transitPort ?? '...' }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ shipment.quote.transportType === TransportType.AIR 
            ? $gettext('Air-port of discharge') 
            : $gettext('Place of Delivery') 
          }}:
        </td>
        <td class="py-1">
          {{ printPort(shipment.quote.destinationPort) }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('ETD') }}:
        </td>
        <td class="py-1">
          {{ 
            shipment.booking.etd 
            ? printDate(shipment.booking.etd) 
            : '...'
          }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Cargo Ready') }}:
        </td>
        <td class="py-1">
          {{ shipment.quote.cargoReady ? printDate(shipment.quote.cargoReady) : '...' }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Commodities') }}:
        </td>
        <td class="py-1">
          {{ shipment.booking.commodities ?? '...' }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Freight terms') }}:
        </td>
        <td class="py-1">
          {{ shipment.booking.freightTerms ? getFreightTermTitle(shipment.booking.freightTerms) : '...' }}
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Sales Rep') }}:
        </td>
        <td class="py-1">
          {{ shipment.salesRep ? [shipment.salesRep.firstName, shipment.salesRep.lastName].join(' ') : '—' }}
          <UserSelect
            v-if="$can('PUT_Manager', 'Shipment') && shipmentEditable"
            class="ps-0" variant="plain" size="small" density="compact" :ripple="false"
            :title="$gettext('Edit Sales Rep')"
            :excepts="shipment.salesRep ? [shipment.salesRep] : []"
            @selected="saveSalesRep"
          >
            <template #activatorContent>
              <VIcon size="16" icon="tabler-pencil" />
            </template>
          </UserSelect>
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Reference') }}:
        </td>
        <td class="py-1">
          {{ shipment.referenceId ?? '—' }}
          <DialogForm
            v-if="shipmentEditable"
            :apiService="ShipmentService"
            :modelValue="{id: shipment.id, referenceId: shipment.referenceId}"
            :layout="() => [[[
              { name: 'referenceId', text: $gettext('Reference') }
            ]]]"
            @entitySubmitted="$emit('shipmentChanged')"
          />
        </td>
      </tr>
      <tr>
        <td class="pe-6 py-1 font-weight-medium d-flex align-start">
          {{ $gettext('Note') }}:
        </td>
        <td class="py-1">
          {{ shipment.note ?? '...' }}
          <DialogForm
            v-if="shipmentEditable"
            :apiService="ShipmentService"
            :modelValue="{id: shipment.id, note: shipment.note}" 
            :layout="() => [[[
                { name: 'note', text: $gettext('Note'), type: 'textarea' }
              ]]]"
            @entitySubmitted="$emit('shipmentChanged')"
          />
        </td>
      </tr>
    </tbody>
  </table>
</VCol>
<VCol class="pe-4 pt-6">
  <VCard :title="$gettext('Client Information')">
    <VCardText>
      <table>
        <tbody>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Name') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultInvoiceInfo.company }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Address') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultInvoiceInfo.address }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Phone') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultInvoiceInfo.phone }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Client ID') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.code }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Tax number') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultInvoiceInfo?.taxNumber }}
            </td>
          </tr>
        </tbody>
      </table>
    </VCardText>
  </VCard>
  <VCard :title="$gettext('Contact')" class="my-4">
    <VCardText>
      <table>
        <tbody>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Name') }}:
            </td>
            <td class="pb-1">
              {{ printPersonName(shipment.quote.client.defaultContact) }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Email') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultContact.email ?? '...' }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Phone') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultContact.phone ?? '...' }}
            </td>
          </tr>
          <tr>
            <td class="pe-6 pb-1 font-weight-medium align-start" style="min-inline-size: 150px">
              {{ $gettext('Title') }}:
            </td>
            <td class="pb-1">
              {{ shipment.quote.client.defaultContact.title ?? '...' }}
            </td>
          </tr>
        </tbody>
      </table>
    </VCardText>
  </VCard>
</VCol>
</VRow>
<DangerousGoodsPanel :shipment="shipment" :editable="shipmentEditable" class="mt-2" />
<TruckPanel v-if="shipment.quote.transportType === TransportType.Road" :shipment="shipment" :editable="shipmentEditable" />
<RailBookingPanel v-if="shipment.quote.transportType === TransportType.Rail" :shipment="shipment" :editable="shipmentEditable" />
<ParcelPanel v-if="shipment.quote.transportType === TransportType.Courier" :shipment="shipment" :editable="shipmentEditable" />
</template>
