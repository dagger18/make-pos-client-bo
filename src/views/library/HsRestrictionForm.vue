<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/HsRestriction'
import EntityService from '@/services/library/HsRestrictionService'

const form = ref(null)
function setEntity(entity = null) { form.value.setEntity(entity) }
defineExpose({ setEntity })
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('HS Restriction')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'900px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
