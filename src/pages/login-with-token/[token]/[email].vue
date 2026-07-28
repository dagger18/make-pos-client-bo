<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { useAuthStore } from '@/stores/authStore'
import CommonService from '@/services/CommonService'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const route = useRoute()
const authStore = useAuthStore()
const error = ref(false)

onMounted(async () => {
  authStore.clearSession()
  try {
    const token = atob(route.params.token)
    const email = atob(route.params.email)

    const response = await $api('/login-with-token', {
      method: 'POST',
      body: CommonService.formData({ token, email }),
    })

    if (response?.accessToken) {
      authStore.login(response, route)
    } else {
      error.value = true
    }
  } catch (e) {
    console.error('Login with token failed:', e)
    error.value = true
  }
})
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="405"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>
        <VImg
          :src="authThemeMask"
          class="auth-footer-mask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText class="d-flex flex-column align-center justify-center pa-8">
          <template v-if="!error">
            <VProgressCircular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            />
            <p class="text-body-1 mb-0">
              Logging you in…
            </p>
          </template>

          <template v-else>
            <VIcon
              icon="tabler-alert-circle"
              size="48"
              color="error"
              class="mb-4"
            />
            <h5 class="text-h5 mb-2">
              Invalid or expired login link
            </h5>
            <RouterLink
              class="text-primary"
              :to="{ name: 'login' }"
            >
              Go to Login
            </RouterLink>
          </template>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
