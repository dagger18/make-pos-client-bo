<script setup>
import AppTableConfirm from '@/components/table/AppTableConfirm.vue'
import SessionExpiredDialog from '@/components/SessionExpiredDialog.vue'
import MaintenanceDialog from '@/components/common/MaintenanceDialog.vue'
import { useAppStore } from '@/stores/appStore'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { useTheme } from 'vuetify'
import { useAuthStore } from './stores/authStore'
import MyProfileService from '@/services/MyProfileService'
import { loadLocale } from '@/plugins/gettext'
import { useOnlineTracking } from '@/composables/useOnlineTracking'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
const appStore = useAppStore()
const authStore = useAuthStore()
if (authStore.user?.language) {
  loadLocale(authStore.user.language)
}
const confirm = ref(null)
watch(
  confirm,
  (value) => {
    if (!value) return
    appStore.confirm = confirm
  }
)
// ping
const { disableOnlineTracking } = useOnlineTracking()
setTimeout(async () => {
  if (!authStore.accessToken) return
  if (disableOnlineTracking.value) return
  const response = await MyProfileService.ping()
  if (response?.newEntities) appStore.newEntities = response.newEntities
  if (typeof response?.notification === 'number') {
    appStore.newEntities.notification = response.notification
  }
}, 1000)
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />

      <ScrollToTop />
    </VApp>
    <MessageSnackBar />
    <AppTableConfirm ref="confirm" />
    <SessionExpiredDialog />
    <MaintenanceDialog />
  </VLocaleProvider>
</template>
