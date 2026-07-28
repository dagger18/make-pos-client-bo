<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/DutyRate'
import EntityService from '@/services/library/DutyRateService'

const form = ref(null)
function setEntity(entity = null) { form.value.setEntity(entity) }
defineExpose({ setEntity })
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('Duty Rate')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'900px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
