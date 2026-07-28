<script setup>
import { CompanyProviderId } from '@/config/enums/AppEnums';
import ProviderDetail from '@/views/provider/ProviderDetail.vue';
definePage({ 
  meta: { action: 'MANAGE', subject: 'Config' },
})
const detail = ref(null)
onMounted(() => {
  detail.value.setEntity(CompanyProviderId)
})
</script>
<template>
  <ProviderDetail
    ref="detail"
  />
</template>
