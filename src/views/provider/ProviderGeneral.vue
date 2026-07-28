<script setup>
import { findByValue as findCreditStatus, getList as creditStatusList } from '@/config/enums/CreditStatus';
import { initLayout, layout, makeDefaultEntity } from '@/config/forms/ProviderGeneral';
import { printMoney, printNullable, transformObject, transformPreSubmit } from '@/services/CommonService';
// ProviderService removed - freight-specific service
const ProviderService = null;
import { useGettext } from 'vue3-gettext';
const { $gettext } = useGettext()
const props = defineProps({
  provider: { type: Object, default: () => {}},
  initMode: { type: Boolean, default: false }
})
const activeLayout = computed(() => props.initMode ? initLayout : layout)
const [modal, toggleModal] = useToggle()
const form = ref(null)
function edit() {
  toggleModal()
  nextTick(() => {
    form.value.setEntity(props.provider)
  })
}
onMounted(() => {
  if (props.initMode) {
    edit()
  }
})
function entityPreSubmit (entity) {
  transformPreSubmit(entity)

  if (entity.creditLimit) {
    transformObject(entity, 'creditLimit')
  }

  return entity
}
const creditDialogOpen = ref(false)
const creditStatusInput = ref('')
const creditHoldReasonInput = ref('')

async function saveCreditStatus() {
  await ProviderService.updateCreditStatus(props.provider.id, {
    creditStatus: creditStatusInput.value,
    creditHoldReason: creditHoldReasonInput.value || null,
    creditReviewedAt: new Date().toISOString().split('T')[0],
  })
  creditDialogOpen.value = false
  emit('providerChanged')
}
function openCreditDialog() {
  creditStatusInput.value = props.provider.creditStatus
  creditHoldReasonInput.value = props.provider.creditHoldReason ?? ''
  creditDialogOpen.value = true
}

const emit = defineEmits([
  'entitySubmitted',
  'providerChanged',
])
function entitySubmitted() {
  toggleModal()
  emit('entitySubmitted')
}
const generalProps = [
  {'key': 'address','text': $gettext('Address')},
  {'key': 'city','text': $gettext('City')},
  {'key': 'province','text': $gettext('Province')},
  {'key': 'zipCode','text': $gettext('Zip Code')},
  {'key': 'country','text': $gettext('Country')},
  {'key': 'phone','text': $gettext('Phone')},
  {'key': 'taxNumber','text': $gettext('Tax Number')},
  {'key': 'trackingUrl','text': $gettext('Tracking Url')},
  {'key': 'note','text': $gettext('Note')},
  {'key': 'description','text': $gettext('Description')},
]
</script>
<template>
  <VCard>
    <VCardText class="text-center pt-5 pb-0">
      <!-- 👉 Avatar -->
      <VAvatar
        rounded
        :size="100"
        :color="'primary'"
        :variant="'tonal'"
      >
        <VImg
          v-if="provider.logo"
          :src="provider.logo.thumbnailPath"
        />
        <span
          v-else
          class="text-5xl font-weight-medium"
        >
          {{ avatarText(provider.name) }}
        </span>
      </VAvatar>

      <!-- 👉 Customer fullName -->
      <h4 class="text-h4  mt-4">
        {{ provider.name }}
      </h4>
      <span class="text-sm">{{ $gettext("Provider ID") }} #{{ provider.code }}</span>
    </VCardText>

    <!-- 👉 Customer Details -->
    <VCardText>
      <VDivider class="my-4" />
      <div class="text-disabled text-uppercase text-sm">
        {{ $gettext("Details") }}
      </div>

      <VList density="compact" >
        <div v-for="generalProp in generalProps" class="d-flex px-0 py-1 align-start justify-start">
            <span class="font-weight-medium me-2">{{ generalProp.text }}:</span>
            <span>
              {{ printNullable(provider[generalProp.key]) }}
            </span>
        </div>
      </VList>
      <VDivider class="my-4" />
      <div class="text-disabled text-uppercase text-sm">
        {{ $gettext("Credit Terms") }}
      </div>

      <VList density="compact" >
        <div class="d-flex px-0 py-1 align-start justify-start">
            <span class="font-weight-medium me-2">{{ $gettext("Credit Limit") }}:</span>
            <span>
              {{ printMoney(provider.creditLimit) }}
            </span>
        </div>
        <div class="d-flex px-0 py-1 align-start justify-start">
            <span class="font-weight-medium me-2">{{ $gettext("Credit Period") }}:</span>
            <span>
              {{ printNullable(provider.creditPeriod, $gettext("day(s)")) }}
            </span>
        </div>
      </VList>
      <div class="mt-4">
        <div class="text-disabled font-weight-bold mb-1">{{ $gettext('Credit Status') }}</div>
        <VChip :color="findCreditStatus(provider.creditStatus)?.color ?? 'default'" class="me-2">
          {{ findCreditStatus(provider.creditStatus)?.title ?? provider.creditStatus }}
        </VChip>
        <VBtn v-if="$can('PUT', 'Provider')" size="small" variant="text" @click="openCreditDialog">
          <VIcon size="16" icon="tabler-pencil" />
        </VBtn>
        <div v-if="provider.creditHoldReason" class="text-caption text-medium-emphasis mt-1">
          {{ provider.creditHoldReason }}
        </div>
      </div>
    </VCardText>

    <VCardText class="text-center">
      <VBtn @click="edit">
        {{ $gettext("Edit Details") }}
      </VBtn>
    </VCardText>
  </VCard>
  <VDialog
    v-model="modal"
    max-width="800"
  >
    <DialogCloseBtn @click="modal = !modal" />
    <VCard :title="$gettext('General Information')">
      <VCardText v-if="initMode" class="pb-0">
        <VAlert type="info" variant="tonal">
          <p class="font-weight-medium mb-1">{{ $gettext('Welcome! Let\'s set up your company profile.') }}</p>
          <p class="text-sm mb-0">{{ $gettext('Please fill in your company details below. This information will be used across the system for documents, invoices, and communications.') }}</p>
        </VAlert>
      </VCardText>
      <VCardText class="pa-0">
        <AppForm
          :layout="activeLayout"
          :isDialog="false"
          :makeDefaultEntity="makeDefaultEntity"
          :service="ProviderService"
          :entityPreSubmit="entityPreSubmit"
          ref="form"
          @entitySubmitted="entitySubmitted()"
        />
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="creditDialogOpen" max-width="480">
    <VCard :title="$gettext('Update Credit Status')">
      <VCardText>
        <VSelect
          v-model="creditStatusInput"
          :label="$gettext('Credit Status')"
          :items="creditStatusList()"
          item-value="value"
          item-title="title"
          class="mb-3"
        />
        <VTextarea
          v-model="creditHoldReasonInput"
          :label="$gettext('Reason / Notes')"
          rows="3"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="creditDialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" @click="saveCreditStatus">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
