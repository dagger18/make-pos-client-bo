<script setup>
import { CompanyProviderId } from '@/config/enums/AppEnums';
import ProviderDetail from '@/views/provider/ProviderDetail.vue';
import { can } from '@layouts/plugins/casl';
import { onMounted } from 'vue';
definePage({
  meta: { action: 'GET', subject: 'Provider' },
})
const detail = ref(null)
const route = useRoute()
const router = useRouter()
const initMode = computed(() => route.query.mode === 'init')
onMounted(() => {
  if(!can('Manage', 'Config') && route.params.id == CompanyProviderId) {
    router.push({name: 'not-authorized'})
  }
  detail.value.setEntity(route.params.id)
})
</script>
<template>
  <ProviderDetail
    ref="detail"
    :initMode="initMode"
    @closed="$router.push($event)"
  />
</template>
