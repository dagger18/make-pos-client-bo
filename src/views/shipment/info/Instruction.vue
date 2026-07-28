<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { layout, makeDefaultEntity } from '@/config/forms/shipment/Instruction';
import { transformArray, transformPreSubmit } from '@/services/CommonService';
// InstructionService removed - freight-specific service
const EntityService = null;
// BookingService removed - freight-specific service
const BookingService = null;
const props = defineProps({
  shipment: { type: Object, default: () => {}}
})
const form = ref(null)
onMounted(() => {
  form.value.setEntity(props.shipment.instruction)
})
function entityPreForm (entity) {
  entity.transportType = props.shipment.quote.transportType

  entity.tabLayout = {
    hblLayout: {
      generalSubForm: {
        ...props.shipment.booking,
      },
      detailHBLSubForm: {
        ...entity
      },
      partiesHBLSubForm: {
        ...entity
      }
    },
  }

  const parentBind = {
    parentId: props.shipment.id,
    parentType: 'shipment',
    parentProperty: 'instruction'
  }
  return Object.assign(JSON.parse(JSON.stringify(parentBind)), entity)
}
function entityPreSubmit (reactedAntity) {
  let entity = JSON.parse(JSON.stringify(reactedAntity))

  transformPreSubmit(entity)

  const {
    id, placeReceipt, portLoading, etd, vesselNo, portDischarge,
    placeDelivery, destination, freightTerms, billLadingType
  } = entity.tabLayout.hblLayout.generalSubForm
  BookingService.update({
    id, placeReceipt, portLoading, etd, vesselNo, portDischarge,
    placeDelivery, destination, freightTerms, billLadingType,
    parentId: entity.parentId,
    parentType: entity.parentType,
    parentProperty: 'booking'
  })
  delete entity.tabLayout.hblLayout.generalSubForm

  const {
    natureQuantityGoods, shippingMarks, packageType
  } = entity.tabLayout.hblLayout.detailHBLSubForm

  const {
    shipperName, shipperAddress, consigneeName, consigneeAddress, notifyName, notifyAddress,
    agentName, agentAddress
  } = entity.tabLayout.hblLayout.partiesHBLSubForm

  delete entity.tabLayout
  if(entity.containers.length > 0) {
    transformArray(entity,'containers')
  }

  return {
    ...entity,
    shipperName, shipperAddress, consigneeName, consigneeAddress, notifyName, notifyAddress,
    agentName, agentAddress,
    natureQuantityGoods,
    shippingMarks,
    packageType
  }
}
const shipmentEditable = computed(() => {
  return props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
</script>
<template>
<AppForm
  :isDialog="false"
  :layout="layout"
  :makeDefaultEntity="makeDefaultEntity"
  :entityPreForm="entityPreForm"
  :entityPreSubmit="entityPreSubmit"
  :service="EntityService"
  :isSaveable="shipmentEditable"
  ref="form"
  class="mx-n3"
/>
</template>
