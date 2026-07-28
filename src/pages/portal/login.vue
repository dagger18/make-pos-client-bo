<script setup>
import { usePortalAuthStore } from '@/stores/portalAuthStore'
import PortalAuthService from '@/services/portal/PortalAuthService'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { layout: 'blank' } })

const { $gettext } = useGettext()
const router = useRouter()
const portalStore = usePortalAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true
  try {
    const result = await PortalAuthService.login(email.value, password.value)
    if (result?.accessToken) {
      portalStore.login(result.accessToken, result.user)
      router.push('/portal/dashboard')
    } else {
      error.value = $gettext('Invalid credentials.')
    }
  } catch {
    error.value = $gettext('Invalid credentials.')
  }
  loading.value = false
}
</script>

<template>
  <VApp>
    <VMain class="d-flex align-center justify-center" style="min-height: 100vh; background: #f5f5f5;">
      <VCard width="400" class="pa-6">
        <VCardTitle class="text-h5 mb-4 text-center">{{ $gettext('Customer Portal') }}</VCardTitle>
        <VAlert v-if="error" type="error" class="mb-4" density="compact">{{ error }}</VAlert>
        <VTextField
          v-model="email"
          :label="$gettext('Email')"
          type="email"
          density="compact"
          class="mb-3"
          @keyup.enter="login"
        />
        <VTextField
          v-model="password"
          :label="$gettext('Password')"
          type="password"
          density="compact"
          class="mb-4"
          @keyup.enter="login"
        />
        <VBtn block color="primary" :loading="loading" @click="login">
          {{ $gettext('Sign In') }}
        </VBtn>
      </VCard>
    </VMain>
  </VApp>
</template>
