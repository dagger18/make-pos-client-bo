<script setup>
import { useGettext } from 'vue3-gettext'
import { loadLocale } from '@/plugins/gettext'
import MyProfileService from '@/services/MyProfileService'
import { useAuthStore } from '@/stores/authStore'

const { current } = useGettext()
const authStore = useAuthStore()

const languages = [
  { code: 'en',    label: 'English' },
  { code: 'zh', label: '中文（简体）' },
  { code: 'vi',    label: 'Tiếng Việt' },
  { code: 'ja',    label: '日本語' },
  { code: 'ko',    label: '한국어' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'es',    label: 'Español' },
  { code: 'ar',    label: 'العربية' },
]

async function switchLanguage(lang) {
  await loadLocale(lang)
  const updatedUser = { ...authStore.user, language: lang }
  await MyProfileService.profile(updatedUser)
  authStore.setLanguage(lang)   // updates Pinia state + cookie so refresh keeps the language
}
</script>

<template>
  <IconBtn>
    <VIcon size="26" icon="tabler-language" />
    <VMenu activator="parent" location="bottom end" offset="14px">
      <VList :selected="[current]" color="primary" min-width="175px">
        <VListItem
          v-for="lang in languages"
          :key="lang.code"
          :value="lang.code"
          @click="switchLanguage(lang.code)"
        >
          <VListItemTitle>{{ lang.label }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
