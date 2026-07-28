<script setup>
import { ref, onMounted } from 'vue'
// CarrierProfileService removed - freight-specific service
const CarrierProfileService = null;
import { getList as carrierTypeList } from '@/config/enums/CarrierType'

const props = defineProps({ provider: { type: Object, required: true } })
const emit = defineEmits(['providerChanged'])
const form = ref({
  scacCode: null, iataCode: null, carrierType: null, alliance: null,
  bookingPlatform: null, bookingEmail: null, siEmail: null,
  amsFiler: null, preferredPayment: null,
})
const saving = ref(false)

onMounted(async () => {
  const profile = await CarrierProfileService.get(props.provider.id)
  if (profile) Object.assign(form.value, profile)
})

async function save() {
  saving.value = true
  await CarrierProfileService.save(props.provider.id, form.value)
  saving.value = false
  emit('providerChanged')
}
</script>
<template>
  <VCard class="mt-4">
    <VCardTitle>{{ $gettext('Carrier Profile') }}</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="3"><VTextField v-model="form.scacCode" :label="$gettext('SCAC Code')" /></VCol>
        <VCol cols="12" md="3"><VTextField v-model="form.iataCode" :label="$gettext('IATA Code')" /></VCol>
        <VCol cols="12" md="3">
          <VSelect v-model="form.carrierType" :label="$gettext('Carrier Type')" :items="carrierTypeList()" item-value="value" item-title="title" clearable />
        </VCol>
        <VCol cols="12" md="3"><VTextField v-model="form.alliance" :label="$gettext('Alliance')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.bookingPlatform" :label="$gettext('Booking Platform')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.bookingEmail" :label="$gettext('Booking Email')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.siEmail" :label="$gettext('SI Email')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.amsFiler" :label="$gettext('AMS Filer')" /></VCol>
        <VCol cols="12" md="4"><VTextField v-model="form.preferredPayment" :label="$gettext('Preferred Payment')" /></VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
    </VCardActions>
  </VCard>
</template>
