<script setup>
import { layout } from '@/config/forms/library/CarrierEventMapping'
import EntityService from '@/services/library/CarrierEventMappingService'

const emit = defineEmits(['entitySubmitted'])
const form = ref(null)

async function setEntity(entity = null) {
  form.value.open(entity ?? {
    carrierScac: '',
    carrierEventCode: '',
    carrierEventDescription: '',
    milestoneCode: null,
    confidence: 'HIGH',
  })
}

defineExpose({ setEntity })
</script>
<template>
  <AppForm
    ref="form"
    :layout="layout()"
    :apiService="EntityService"
    :title="$gettext('Carrier Event Mapping')"
    @entitySubmitted="$emit('entitySubmitted')"
  />
</template>
