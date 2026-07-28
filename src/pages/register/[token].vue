<script setup>
import CommonService from '@/services/CommonService'
import { useAppStore } from '@/stores/appStore'
import { useGettext } from 'vue3-gettext'

import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'
const { $gettext } = useGettext()
const appStore = useAppStore()
const company = computed(() => appStore.organizationInfo?.name ?? import.meta.env.VITE_COMPANY)
const imageVariant = useGenerateImageVariant(authV2RegisterIllustrationLight, authV2RegisterIllustrationDark, authV2RegisterIllustrationBorderedLight, authV2RegisterIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})
const loading = ref(false)
const route = useRoute();
const router = useRouter()
console.log(route)
const form = ref({
  firstName: '',
  lastName: '',
  title: '',
  password: '',
  token: route.params.token
})

const isPasswordVisible = ref(false)
const errors = ref([])
async function submit() {
  loading.value = true
  const res = await $api('/register', {
    method: 'POST',
    body: CommonService.formData(form.value),
    onResponseError({ response }) {
      errors.value = response._data.errors
    },
  })
  loading.value = false
  // todo: confirm popup that you are registered and redirect to login page
  // failed popup
  if(res.result && res.result === 'invalid token') {
    useAppStore().pushErrorMessage(
      {
        status: 400, 
        detail: $gettext('Your token is invalid or expired.')
      }
    )
    return
  }
  if(res.result && res.result === 'success') {
    const confirmed = await useAppStore().confirm.open(
      $gettext('Congratulation!!! New account created'),
      $gettext('You have been successfully registered. Please login to start using our platform.'),
      { color: 'success' }
    )
    router.push({name: 'login'})
  }
  
  console.log(res)
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="441"
            :src="imageVariant"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText class="mt-n2">
          <h5 class="text-h5 mb-1">
            {{ $gettext("You have been invited to back office of") }} <a>{{ company }}</a> 🚀
          </h5>
          <p class="mb-0">
            {{ $gettext("Please finish register process!") }}
          </p>
        </VCardText>

        <VCardText class="pb-0">
          <VForm>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.firstName"
                  :rules="[requiredValidator]"
                  autofocus
                  :label="$gettext('First Name')"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.lastName"
                  :rules="[requiredValidator]"
                  autofocus
                  :label="$gettext('Last Name')"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.title"
                  autofocus
                  :label="$gettext('Title')"
                />
              </VCol>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :rules="[requiredValidator]"
                  :label="$gettext('Password')"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <VBtn
                  block
                  type="submit" class="mt-10"
                  @click="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  {{ $gettext('Sign up') }}
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span>{{ $gettext('Already have an account?') }}</span>
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'login' }"
                >
                  {{ $gettext('Sign in instead') }}
                </RouterLink>
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
