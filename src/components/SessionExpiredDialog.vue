<script setup>
import { useSessionExpiryStore } from '@/stores/sessionExpiryStore'
import { useAuthStore } from '@/stores/authStore'
import { useGettext } from 'vue3-gettext'

const sessionExpiryStore = useSessionExpiryStore()
const authStore = useAuthStore()
const { $gettext } = useGettext()

const countdown = ref(10)
let timer = null

watch(() => sessionExpiryStore.isNullified, (val) => {
  if (!val) return
  countdown.value = 10
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      handleRedirect()
    }
  }, 1000)
})

function handleRedirect() {
  sessionExpiryStore.reset()
  authStore.logout()
}
</script>

<template>
  <VDialog
    :model-value="sessionExpiryStore.isNullified"
    max-width="420"
    persistent
  >
    <VCard>
      <VCardTitle class="text-h6 pt-5 px-5">
        {{ $gettext('Session ended') }}
      </VCardTitle>
      <VCardText class="px-5">
        {{ $gettext('Your account was signed in on another device. You will be redirected to the login page in') }}
        <strong>{{ countdown }}</strong> {{ countdown !== 1 ? $gettext('seconds') : $gettext('second') }}.
      </VCardText>
      <VCardActions class="px-5 pb-5">
        <VSpacer />
        <VBtn
          color="primary"
          variant="elevated"
          @click="handleRedirect"
        >
          {{ $gettext('Sign in again now') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
