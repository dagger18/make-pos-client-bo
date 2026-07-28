<script setup>
import { useAppStore } from '@/stores/appStore'
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()
const appStore = useAppStore()
</script>

<template>
  <VDialog
    :model-value="appStore.maintenance"
    max-width="420"
    persistent
    no-click-animation
  >
    <VCard>
      <VCardText class="text-center pa-8">
        <VIcon
          icon="tabler-tools"
          size="56"
          color="warning"
          class="mb-4"
        />
        <h5 class="text-h5 font-weight-bold mb-2">
          {{ $gettext('System Maintenance') }}
        </h5>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ $gettext('The server is temporarily under maintenance. Please wait 5–10 minutes and try again.') }}
        </p>
        <VBtn
          color="primary"
          @click="() => window.location.reload()"
        >
          {{ $gettext('Retry') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
