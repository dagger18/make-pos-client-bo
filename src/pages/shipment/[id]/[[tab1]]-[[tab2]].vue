<script setup>
import ShipmentDetail from '@/views/shipment/ShipmentDetail.vue';
definePage({ 
  meta: { action: 'GET', subject: 'Shipment', navActiveLink: 'shipment-transport-type' },
})
const detail = ref(null)
const route = useRoute()
onMounted(() => {
  detail.value.setEntity(route.params.id)
})
function onClosed($event) {
  window.location.href = $event
}
</script>
<template>
<ShipmentDetail
  ref="detail" pushUrl
  @closed="onClosed"
/>
</template>
