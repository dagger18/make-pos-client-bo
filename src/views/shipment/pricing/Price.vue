<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { priceLayout } from '@/config/forms/quote/Quote';
import QuoteForm from '@/views/quote/QuoteForm.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
const form = ref(null)
onMounted(async () => {
  form.value.setEntity(props.shipment.quote)
})
watch(() => props.shipment?._quoteLoaded, (loaded) => {
  if (loaded && form.value) {
    form.value.setEntity(props.shipment.quote)
  }
})
const emit = defineEmits(['shipmentChanged'])
const shipmentEditable = computed(() => {
  return props.shipment 
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
</script>
<template>
<QuoteForm
  ref="form"
  :inlineForm="true"
  :layout="priceLayout"
  :submitBtnSaveText="$gettext('Update')"
  :entityName="''"
  :isSaveable="shipmentEditable"
  @entitySubmitted="emit('shipmentChanged')"
/>
</template>

