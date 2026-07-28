<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/library/PaymentMethod';
import EntityService from '@/services/library/PaymentMethodService';

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
    :entityName="$gettext('Payment Method')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
