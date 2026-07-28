<script setup>
import Uploader from '@/components/common/Uploader/Uploader.vue';
import { CompanyProviderId } from '@/config/enums/AppEnums';
import { valueToSlug } from '@/config/enums/ProviderType';
import EntityService from '@/services/ProviderService';
import BankAccounts from './BankAccounts.vue';
import Contacts from './Contacts.vue';
import InvoiceInfos from './InvoiceInfos.vue';
import { useAuthStore } from '@/stores/authStore';
import ProviderGeneral from './ProviderGeneral.vue'
import ProviderUser from './ProviderUser.vue';
import CarrierProfile from './CarrierProfile.vue'
import AgentProfile from './AgentProfile.vue'
import Addresses from './Addresses.vue'
import ExchangeRateGroup from '@/views/setting/ExchangeRateGroup.vue'
const props = defineProps({
  initMode: { type: Boolean, default: false }
})
const [loading, toggleLoading] = useToggle()
const state = reactive({
  entity: null
})
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showExchangeRateDialog = ref(false)
const showCongratsDialog = ref(false)
let preProviderUrl = null
function handleEntitySubmitted() {
  if (props.initMode) {
    authStore.markProviderReady()
    showExchangeRateDialog.value = true
  } else {
    setEntity(state.entity.id)
  }
}
function onExchangeRateSaved() {
  authStore.markOrgInitialized()
  showExchangeRateDialog.value = false
  showCongratsDialog.value = true
}
function confirmCongrats() {
  showCongratsDialog.value = false
  router.push({ name: 'first-route' })
}
async function setEntity (entityId) {
  toggleLoading()
  state.entity = await EntityService.get(entityId)
  toggleLoading()
  document.querySelector('html').classList.add('overflow-y-hidden');
  if (props.initMode && route.query.step === 'exchange-rate') {
    showExchangeRateDialog.value = true
  }
  if(state.entity.id === CompanyProviderId || route.name === 'setting-company') return
  preProviderUrl = window.location.pathname + window.location.search + window.location.hash
  history.pushState(
    {},
    null,
    router.resolve({ name: 'provider-id-id', params: { id: state.entity.id } }).href
  )
}
const emit = defineEmits(['closed'])
function reset () {
  if(state.entity.id === CompanyProviderId) return
  const backRoute = router.resolve({ name: 'provider-provider-type', params: { providerType: valueToSlug(state.entity.type) } }).href
  document.querySelector('html').classList.remove('overflow-y-hidden');
  emit('closed', backRoute)
  history.pushState(
    {},
    null,
    preProviderUrl ?? backRoute
  )
  preProviderUrl = null
  state.entity = null
}
defineExpose({
  setEntity
})
</script>
<template>
<div class="form-dialog" v-show="state.entity">
  <VCard
    class="form-title mx-4"
    v-if="state.entity"
    :loading="loading" 
    :title="state.entity.id === CompanyProviderId ? $gettext('Company Info') : $gettext('View Provider Detail')"
  >
    <template #append v-if="state.entity.id !== CompanyProviderId">
      <div class="form-close d-flex me-n4">
        <v-btn variant="text" size="small" @click="reset" color="primary">
          <VIcon icon="tabler-x" size="30" />
        </v-btn>
      </div>
    </template>
  </VCard>
  <v-row class="px-4 pt-4" v-if="state.entity">
    <v-col cols="12" :lg="initMode ? 12 : 4">
      <ProviderGeneral :provider="state.entity" :initMode="initMode" @entitySubmitted="handleEntitySubmitted" />
    </v-col>
    <v-col cols="12" lg="8" v-if="!initMode">
      <InvoiceInfos
        :parent="state.entity"
        :parentBind="{parentType: 'provider', parentId: state.entity.id, parentProperty: 'invoiceInfo'}"
        @entitySubmitted="setEntity(state.entity.id)"
      />
      <VCard :title="$gettext('Documents')" class="mt-4">
        <VCardText class="d-flex flex-column gap-y-4">
          <Uploader
            v-model="state.entity.documents"
            :parentBind="{parentType: 'provider', parentId: state.entity.id, parentProperty: 'document'}"
          />
        </VCardText>
      </VCard>
      <Contacts
        :parent="state.entity"
        :parentBind="{parentType: 'provider', parentId: state.entity.id, parentProperty: 'contact'}"
        @entitySubmitted="setEntity(state.entity.id)"/>
      <BankAccounts
        :parent="state.entity"
        :parentBind="{parentType: 'provider', parentId: state.entity.id, parentProperty: 'bankAccount'}"
        @entitySubmitted="setEntity(state.entity.id)"/>
      <ProviderUser
        :parent="state.entity" class="mt-4"
        @entitySubmitted="setEntity(state.entity.id)" />
      <CarrierProfile
        v-if="['CA', 'AL'].includes(state.entity.type)"
        :provider="state.entity"
        @providerChanged="setEntity(state.entity.id)" />
      <AgentProfile
        v-if="state.entity.type === 'AG'"
        :provider="state.entity"
        @providerChanged="setEntity(state.entity.id)" />
      <Addresses :providerId="state.entity.id" class="mt-4" />
    </v-col>
  </v-row>

  <VDialog v-model="showExchangeRateDialog" max-width="700" persistent>
    <VCard :title="$gettext('One more step')">
      <VCardText>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ $gettext('Set up your default currency and exchange rates before getting started.') }}</p>
        <ExchangeRateGroup :initMode="true" @saved="onExchangeRateSaved" />
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="showCongratsDialog" max-width="480" persistent>
    <VCard>
      <VCardText class="text-center pa-8">
        <VIcon icon="tabler-circle-check" size="64" color="success" class="mb-4" />
        <h4 class="text-h4 mb-3">{{ $gettext('Setup Complete!') }}</h4>
        <p class="text-body-1 mb-0">{{ $gettext('Your company profile and exchange rates have been configured. You\'re all set to start using the system.') }}</p>
      </VCardText>
      <VCardActions class="justify-center pb-6">
        <VBtn color="primary" size="large" @click="confirmCongrats">{{ $gettext('Get Started') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</div>
</template>
