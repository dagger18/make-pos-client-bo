<script setup>
import QuotePreview from '@/views/quote/QuotePreview.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
const preview = ref(null)
onMounted(() => {
  preview.value.setEntity(props.shipment.quote)
})

</script>
<template>
<QuotePreview
  ref="preview"
  :isDialog="false"
/>
</template>
