<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/ShipmentMode';
import EntityService from '@/services/library/ShipmentModeService';

const form = ref(null)
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
    :entityName="$gettext('Shipment Mode')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
