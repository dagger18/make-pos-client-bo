<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/HsCode'
import EntityService from '@/services/library/HsCodeService'

const form = ref(null)
function setEntity(entity = null) { form.value.setEntity(entity) }
defineExpose({ setEntity })
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('HS Code')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'900px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
