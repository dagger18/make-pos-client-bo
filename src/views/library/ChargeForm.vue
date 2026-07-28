<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/Charge';
import EntityService from '@/services/library/ChargeService';
const props = defineProps({
  currentTransportType: { type: Object, default: () => {} },
  currentChargeType: { type: Object, default: () => {} }
})
const form = ref(null)
function entityPreForm (entity) {
  entity.transportType = props.currentTransportType.value
  entity.chargeType = props.currentChargeType.value
  return entity
}
function setEntity(entity = null) {
  form.value.setEntity(entity)
}
defineExpose({
  setEntity
})
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="currentChargeType.singularTitle"
    :makeDefaultEntity="makeDefaultEntity"
    :entityPreForm="entityPreForm"
    :service="EntityService"
    ref="form"
    :width="'800px'"
  />
</template>
