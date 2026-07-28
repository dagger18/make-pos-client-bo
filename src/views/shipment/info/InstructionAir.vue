<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { layout, makeDefaultEntity } from '@/config/forms/shipment/InstructionAir';
import { transformPreSubmit } from '@/services/CommonService';
// InstructionService removed - freight-specific service
const EntityService = null;
const props = defineProps({
  shipment: { type: Object, default: () => {}}
})
const form = ref(null)
onMounted(() => {
  form.value.setEntity(props.shipment.instruction)
})
function entityPreForm (entity) {
  entity.transportType = props.shipment.quote.transportType
  const {
    placeReceipt, portLoading, pickup, etd, warehouse, 
    portDischarge, placeDelivery, destination, eta,

    freightTerms, terms,
  } = props.shipment.booking

  let {
    ata, atd,

    grossWeight, grossWeightUnit, volume, 
    chargeableWeight, rateCharge, rateChargeAsAgreed,
    packageCount, packageType, total,
    rateClass, commodityItemNumber,
  } = entity

  if(!grossWeightUnit) {
    grossWeightUnit = 'KGS'
  }

  entity.generalSubForm = {
    placeReceipt, portLoading, pickup, etd, warehouse,
    portDischarge, placeDelivery, destination, eta,
    ata,atd
  }
  entity.rateSubForm = {
    grossWeight, grossWeightUnit, volume, 
    chargeableWeight, rateCharge, rateChargeAsAgreed,
    packageCount, packageType, total,
    rateClass, commodityItemNumber
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
  console.log('after parse', entity)
  const {
    ata, atd
  } = entity.generalSubForm
  
  const {
    grossWeight, grossWeightUnit, volume, 
    chargeableWeight, rateCharge, rateChargeAsAgreed,
    packageCount, packageType, total,
    rateClass, commodityItemNumber
  } = entity.rateSubForm

  entity = {
    ...entity,
    ata, atd,

    grossWeight, grossWeightUnit, volume, 
    chargeableWeight, rateCharge, rateChargeAsAgreed,
    packageCount, packageType, total,
    rateClass, commodityItemNumber
  }
  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
  
  console.log('final object', JSON.parse(JSON.stringify(entity)))

  return entity
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
