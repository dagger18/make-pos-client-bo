<script setup>
import { useGettext } from 'vue3-gettext'
import { useConfigStore } from '@core/stores/config'
import { useAuthStore } from '@/stores/authStore'
import { gettext, loadLocale } from '@/plugins/gettext'
import { useDocsFab } from '@/composables/useDocsFab'
import NotificationPreferenceService from '@/services/NotificationPreferenceService'
import AppTableTitle from '@/components/table/AppTableTitle.vue'
import { useAttrs } from 'vue'

definePage({ meta: { action: 'GET', subject: 'User' } })

const { $gettext } = useGettext()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { showDocsFab } = useDocsFab()
const attrs = useAttrs()

const preferences = ref([])
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

const theme = ref([configStore.theme])
watch(() => configStore.theme, () => {
  theme.value = [configStore.theme]
}, { deep: true })

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文（简体）' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
]

onMounted(async () => {
  preferences.value = await NotificationPreferenceService.getPreferences() ?? []
  loading.value = false
})

async function save() {
  saving.value = true
  const payload = preferences.value.flatMap(rule =>
    rule.channels.map(ch => ({
      ruleKey:    rule.ruleKey,
      channel:    ch.channel,
      isEnabled:  ch.isEnabled,
      digestMode: ch.digestMode,
    }))
  )
  await NotificationPreferenceService.savePreferences(payload)
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}

async function switchLanguage(lang) {
  await loadLocale(lang)
  authStore.setLanguage(lang)
}
</script>

<template>
  <AppTableTitle :toggleVerticalOverlayNavActive="attrs.toggleVerticalOverlayNavActive">
    <span class="primary--text text-h5">{{ $gettext('User Settings') }}</span>
  </AppTableTitle>

  <VRow class="mt-4">
    <!-- Left: Notifications + Navigation -->
    <VCol cols="12" md="6" class="d-flex flex-column gap-4">
      <VCard :loading="loading" :title="$gettext('Notification Preferences')">
        <template #subtitle>
          {{ $gettext('Choose which notifications you receive and how.') }}
        </template>

        <VDivider />

        <VAlert v-if="saved" type="success" class="ma-4" density="compact">
          {{ $gettext('Preferences saved.') }}
        </VAlert>

        <VTable>
          <thead>
            <tr>
              <th>{{ $gettext('Notification') }}</th>
              <th>{{ $gettext('Description') }}</th>
              <th>{{ $gettext('Priority') }}</th>
              <th>{{ $gettext('Channel') }}</th>
              <th>{{ $gettext('Enabled') }}</th>
              <th>{{ $gettext('Digest') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="rule in preferences" :key="rule.ruleKey">
              <tr v-for="(ch, i) in rule.channels" :key="ch.channel">
                <td v-if="i === 0" :rowspan="rule.channels.length" class="font-weight-medium">
                  {{ rule.name }}
                </td>
                <td v-if="i === 0" :rowspan="rule.channels.length" class="text-body-2 text-medium-emphasis" style="max-width:200px">
                  {{ rule.description ?? '—' }}
                </td>
                <td v-if="i === 0" :rowspan="rule.channels.length">
                  <VChip size="x-small" :color="rule.priority === 'HIGH' ? 'error' : 'default'">
                    {{ rule.priority }}
                  </VChip>
                </td>
                <td><VChip size="x-small">{{ ch.channel }}</VChip></td>
                <td><VSwitch v-model="ch.isEnabled" density="compact" hide-details /></td>
                <td>
                  <VSwitch
                    v-model="ch.digestMode"
                    density="compact"
                    hide-details
                    :disabled="!ch.isEnabled"
                  />
                </td>
              </tr>
            </template>
            <tr v-if="!preferences.length && !loading">
              <td colspan="6" class="text-center text-medium-emphasis py-6">
                {{ $gettext('No notification rules configured.') }}
              </td>
            </tr>
          </tbody>
        </VTable>

        <VCardActions class="pa-4">
          <VBtn color="primary" :loading="saving" @click="save">
            {{ $gettext('Save Preferences') }}
          </VBtn>
        </VCardActions>
      </VCard>

      <VCard :title="$gettext('Navigation')">
        <VDivider />
        <VCardText>
          <p class="text-body-2 font-weight-medium mb-1">{{ $gettext('Sidebar theme') }}</p>
          <VSelect
            :modelValue="configStore.navTheme"
            @update:modelValue="configStore.navTheme = $event"
            :items="['system', 'dark', 'light']"
            density="compact"
            hide-details
            class="mb-4"
          />
          <VSwitch
            v-model="configStore.isVerticalNavCollapsed"
            :label="$gettext('Auto-collapse sidebar')"
            color="primary"
            hide-details
            density="compact"
          />
          <p class="text-caption text-medium-emphasis mt-2 mb-0">
            {{ configStore.isVerticalNavCollapsed
              ? $gettext('Sidebar stays at 46 px; hover to expand to 180 px.')
              : $gettext('Sidebar is always expanded at 180 px.') }}
          </p>
          <VDivider class="my-4" />
          <VSwitch
            v-model="showDocsFab"
            :label="$gettext('Show help button')"
            color="primary"
            hide-details
            density="compact"
          />
          <p class="text-caption text-medium-emphasis mt-2 mb-0">
            {{ $gettext('Floating button at the bottom-right to open the user guide.') }}
          </p>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Right: Theme + Language -->
    <VCol cols="12" md="6" class="d-flex flex-column gap-4">
      <VCard :title="$gettext('Theme')">
        <VDivider />
        <VCardText>
          <VSelect
            :modelValue="theme"
            @update:modelValue="configStore.theme = $event"
            :items="['system', 'dark', 'light']"
          />
        </VCardText>
      </VCard>

      <VCard :title="$gettext('Language')">
        <VDivider />
        <VCardText>
          <VList :selected="[gettext.current]" color="primary" density="compact">
            <VListItem
              v-for="lang in languages"
              :key="lang.code"
              :value="lang.code"
              rounded="lg"
              @click="switchLanguage(lang.code)"
            >
              <VListItemTitle>{{ lang.label }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
