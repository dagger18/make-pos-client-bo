<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/Department';
import EntityService from '@/services/DepartmentService';

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
    :entityName="$gettext('Department')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'600px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
