import { createGettext } from 'vue3-gettext'

export const gettext = createGettext({
  availableLanguages: {
    en:    'English',
    zh: '中文（简体）',
    vi:    'Tiếng Việt',
    ja:    '日本語',
    ko:    '한국어',
    de:    'Deutsch',
    es:    'Español',
    ar:    'العربية',
  },
  defaultLanguage: 'en',
  translations: {},
  silent: true,
})

const loaded = new Set(['en'])

export async function loadLocale(lang) {
  if (!loaded.has(lang) && lang !== 'en') {
    const data = await import(`../locales/${lang}.json`)
    gettext.translations[lang] = data.default ?? data
    loaded.add(lang)
  }
  gettext.current = lang

  const isRtl = lang === 'ar'
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', lang)

  // Update Vuetify locale and RTL — imported lazily to avoid circular dep
  const { vuetify } = await import('@/plugins/vuetify')
  vuetify.locale.current.value = lang
}

export default function (app) {
  app.use(gettext)
}
