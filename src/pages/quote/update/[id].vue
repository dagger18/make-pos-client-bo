<script setup>
import QuoteService from '@/services/QuoteService';
import QuoteForm from '@/views/quote/QuoteForm.vue';
definePage({ 
  meta: { action: 'GET', subject: 'Quote', navActiveLink: 'quote-transport-type' },
})
const form = ref(null)
const route = useRoute()
onMounted(async () => {
  form.value.setEntity(await QuoteService.get(route.params.id))
})
</script>
<template>
<QuoteForm
  ref="form" 
  @closed="$router.push($event)"
/>
</template>
