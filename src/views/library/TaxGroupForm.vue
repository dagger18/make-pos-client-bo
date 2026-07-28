<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/TaxGroup';
import EntityService from '@/services/library/TaxGroupService';

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
    :entityName="$gettext('Tax Group')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
