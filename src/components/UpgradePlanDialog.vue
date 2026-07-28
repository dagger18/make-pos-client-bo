<script setup>
import { useUpgradeDialog } from '@/composables/useUpgradeDialog'
import { useAuthStore } from '@/stores/authStore'
import { useGettext } from 'vue3-gettext'

const { visible, close } = useUpgradeDialog()
const authStore = useAuthStore()
const { $gettext } = useGettext()
const isOrgOwner = computed(() => !!authStore.organizationConfig)
const loading = ref(false)

async function openUpgradeForm() {
  loading.value = true
  try {
    const res = await $api('my-profile/upgrade-link')
    if (res?.link) {
      window.open(res.link, '_blank')
      close()
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="480"
  >
    <VCard>
      <VCardText class="pa-6 text-center">
        <VIcon
          icon="tabler-crown"
          size="56"
          color="warning"
          class="mb-4"
        />

        <h5 class="text-h5 font-weight-bold mb-2">
          {{ $gettext('Feature Not Available') }}
        </h5>

        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ $gettext('This feature is not included in your current plan. Please contact your system administrator or upgrade your plan to gain access.') }}
        </p>

        <div class="d-flex justify-center gap-3">
          <VBtn
            color="primary"
            prepend-icon="tabler-crown"
            @click="close"
          >
            {{ $gettext('Got it') }}
          </VBtn>
          <VBtn
            v-if="isOrgOwner"
            color="warning"
            prepend-icon="tabler-external-link"
            :loading="loading"
            @click="openUpgradeForm"
          >
            {{ $gettext('Upgrade now') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
