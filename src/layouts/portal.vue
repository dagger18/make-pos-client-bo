<script setup>
// portalAuthStore removed - freight-specific portal auth
import PortalAuthService from '@/services/portal/PortalAuthService'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()
const router = useRouter()

async function logout() {
  try { await PortalAuthService.logout() } catch {}
  router.push('/portal/login')
}
</script>

<template>
  <VApp>
    <VAppBar elevation="1" color="white">
      <VAppBarTitle>
        <span class="text-primary font-weight-bold">Customer Portal</span>
      </VAppBarTitle>
      <template #append>
        <span class="text-body-2 me-4 text-medium-emphasis">{{ portalStore.user?.email }}</span>
        <VBtn variant="text" size="small" @click="logout">
          <VIcon icon="tabler-logout" class="me-1" size="18" /> {{ $gettext('Logout') }}
        </VBtn>
      </template>
    </VAppBar>
    <VMain>
      <VContainer fluid class="py-6">
        <RouterView />
      </VContainer>
    </VMain>
  </VApp>
</template>
