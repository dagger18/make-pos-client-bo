<script setup>
import QuotePreview from '@/views/quote/QuotePreview.vue';
import { useRouter } from 'vue-router';
definePage({ 
  meta: { action: 'GET', subject: 'Quote' },
})
const preview = ref(null)
const route = useRoute()
const router = useRouter()
onMounted(() => {
  preview.value.setEntity(route.params.id)
})
function openUpdateFromPreview(quote) {
  router.push({name: 'quote-update-id', params: {id: quote.id}})
}
function onClosed($event) {
  window.location.href = $event
}
</script>
<template>
<QuotePreview
  ref="preview" 
  @closed="onClosed"
  @openUpdate="openUpdateFromPreview"
/>
</template>
