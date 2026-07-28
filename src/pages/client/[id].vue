<script setup>
import ClientDetail from '@/views/client/ClientDetail.vue';
definePage({ 
  meta: { action: 'GET', subject: 'Client' },
})
const detail = ref(null)
const route = useRoute()
onMounted(() => {
  detail.value.setEntity(route.params.id)
})
</script>
<template>
  <ClientDetail
    ref="detail"
    @closed="$router.push({name: 'client'})"
  />
</template>
