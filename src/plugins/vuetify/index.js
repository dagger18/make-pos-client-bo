import { deepMerge } from '@antfu/utils'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { staticPrimaryColor, themes } from './theme'
import { cookieRef } from '@/@layouts/stores/config'
import '@core/scss/template/libs/vuetify/index.scss'
import DayJsAdapter from "@date-io/dayjs"
import 'vuetify/styles'

const dayJsAdapter = new DayJsAdapter({ locale: 'en' })
dayJsAdapter.rawDayJsInstance.extend(relativeTime)
export const dateAdapter = dayJsAdapter

export let vuetify = null

export default function (app) {
  const cookieThemeValues = {
    defaultTheme: resolveVuetifyTheme(),
    themes: {
      light: {
        colors: {
          primary: cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
        },
      },
      dark: {
        colors: {
          primary: cookieRef('darkThemePrimaryColor', staticPrimaryColor).value,
        },
      },
    },
  }

  const optionTheme = deepMerge({ themes }, cookieThemeValues)

  vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: optionTheme,
    date: {
      adapter: dayJsAdapter,
    },
    locale: {
      locale: 'en',
      rtl: { ar: true },
    },
  })

  app.use(vuetify)
}
