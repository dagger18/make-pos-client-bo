<!-- ❗Errors in the form are set on line 60 -->
<script setup>
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { useGettext } from 'vue3-gettext'
import { VForm } from 'vuetify/components/VForm'
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const { $gettext } = useGettext()
const appStore = useAppStore()
const company = computed(() => appStore.organizationInfo?.name ?? import.meta.env.VITE_COMPANY)
definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})
const loading = ref(false)
const isPasswordVisible = ref(false)
const route = useRoute()
const errors = ref({
  email: null,
  password: null,
})

const refVForm = ref()
const authStore = useAuthStore()
const credentials = ref({
  email: '',
  password: '',
})

const rememberMe = ref(false)

const login = async () => {
  loading.value = true
  const response = await $api('/auth', {
    method: 'POST',
    body: {
      username: credentials.value.email,
      password: credentials.value.password,
    },
    loading: true,
    noPushMessage: true
  })
  loading.value = false
  if(response.error) {
    errors.value.email = $gettext('Wrong credentials')
    errors.value.password = $gettext('Wrong credentials')
    return
  }
  authStore.login(response, route)
  // ping
  /*
  setTimeout(async () => {
    if(!authStore.accessToken) return
    const response = await UserService.ping()
    useAppStore().newEntities = response.newEntities
  }, 1000)
  */
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
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
        <VCardText>

          <h4 class="text-h4 mb-1">
            {{ $gettext('Welcome to') }} {{company}}! 👋🏻
          </h4>
          <p class="mb-0">
            {{ $gettext('Please sign-in to your account and start the adventure') }}
          </p>
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  :label="$gettext('Username')"
                  placeholder=""
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  :label="$gettext('Password')"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-1 mb-4">
                  <VCheckbox
                    v-model="rememberMe"
                    :label="$gettext('Remember me')"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    {{ $gettext('Forgot Password?') }}
                  </RouterLink>
                </div>

                <SubmitBtn
                  block
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  {{ $gettext('Login') }}
                </SubmitBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
