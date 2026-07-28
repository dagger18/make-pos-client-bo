<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/UserGroup';
import EntityService from '@/services/UserGroupService';

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
    :entityName="$gettext('Group')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
