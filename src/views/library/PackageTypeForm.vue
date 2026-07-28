<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/PackageType';
import EntityService from '@/services/library/PackageTypeService';
const props = defineProps({
  currentTransportType: { type: String, default: '' }
})
const form = ref(null)

function entityPreForm (entity) {
  entity.transportType = props.currentTransportType
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
    :entityName="$gettext('Packge Type')"
    :makeDefaultEntity="makeDefaultEntity"
    :entityPreForm="entityPreForm"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
