<script setup>
import ConfigService from '@/services/ConfigService'

const format = ref('')
const saving = ref(false)
const tokens = ref([])

onMounted(async () => {
  const [formatRes, tokensRes] = await Promise.all([
    ConfigService.get('quoteCodeFormat'),
    ConfigService.getQuoteCodeTokens()
  ])
  format.value = formatRes.value ?? tokensRes.default
  tokens.value = tokensRes.tokens
})

function insertToken(token) {
  format.value = (format.value ?? '') + token
}

async function save() {
  saving.value = true
  try {
    await ConfigService.update('quoteCodeFormat', format.value)
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <VCard :title="$gettext('Quote Code Format')">
    <VCardText>
      <p class="text-body-2 mb-3">
        {{ $gettext('Define the format used when a quote is created. Click a token to append it to the format string.') }}
      </p>
      <VTextField
        v-model="format"
        :label="$gettext('Format')"
        density="compact"
        class="mb-3"
      />
      <div class="d-flex flex-wrap gap-2 mb-4">
        <VChip
          v-for="t in tokens"
          :key="t.token"
          size="small"
          color="primary"
          variant="outlined"
          class="cursor-pointer"
          @click="insertToken(t.token)"
        >
          {{ t.token }}
          <VTooltip activator="parent" location="top">{{ t.description }}</VTooltip>
        </VChip>
      </div>
      <div class="text-caption text-medium-emphasis mb-4">
        {{ $gettext('Preview example') }}: <strong>{{ format.replace('$GlobalCounter', '00000001').replace('$MonthlyCounter', '00001').replace('$Branch', 'HCM').replace('$TransType', 'OCN').replace('$YearMonth', '202604').replace('$OrgCode', 'HCM').replace('$DestCode', 'ORD') }}</strong>
      </div>
      <VBtn
        color="primary"
        :loading="saving"
        @click="save"
      >
        {{ $gettext('Save') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>
