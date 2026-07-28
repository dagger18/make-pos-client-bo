<script setup>
import { ref, onMounted } from 'vue'
// AgentProfileService removed - freight-specific service
const AgentProfileService = null;

const props = defineProps({ provider: { type: Object, required: true } })
const emit = defineEmits(['providerChanged'])
const form = ref({
  network: null, agentCode: null, coverageCountries: null, modesHandled: null,
  commissionRate: null, settlementCurrency: null, settlementTerms: null, performanceScore: null,
})
const saving = ref(false)

onMounted(async () => {
  const profile = await AgentProfileService.get(props.provider.id)
  if (profile) Object.assign(form.value, {
    ...profile,
    coverageCountries: profile.coverageCountries ? JSON.stringify(profile.coverageCountries) : null,
    modesHandled: profile.modesHandled ? JSON.stringify(profile.modesHandled) : null,
  })
})

async function save() {
  saving.value = true
  await AgentProfileService.save(props.provider.id, form.value)
  saving.value = false
  emit('providerChanged')
}
</script>
<template>
  <VCard class="mt-4">
    <VCardTitle>{{ $gettext('Agent Profile') }}</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="4"><VTextField v-model="form.network" :label="$gettext('Network (WCA, FIATA...)')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.agentCode" :label="$gettext('Agent Code')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.settlementCurrency" :label="$gettext('Settlement Currency')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.settlementTerms" :label="$gettext('Settlement Terms')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.commissionRate" :label="$gettext('Commission Rate (%)')" type="number" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.performanceScore" :label="$gettext('Performance Score (0-5)')" type="number" /></VCol>
        <VCol cols="12"><VTextarea v-model="form.coverageCountries" :label="$gettext('Coverage Countries (JSON array, e.g. [&quot;VN&quot;,&quot;TH&quot;])')" rows="2" /></VCol>
        <VCol cols="12"><VTextarea v-model="form.modesHandled" :label="$gettext('Modes Handled (JSON array, e.g. [&quot;OCN&quot;,&quot;AIR&quot;])')" rows="2" /></VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
    </VCardActions>
  </VCard>
</template>
