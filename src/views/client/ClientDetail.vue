<script setup>
import Uploader from '@/components/common/Uploader/Uploader.vue';
import EntityService from '@/services/ClientService';
import ClientGeneral from '@/views/client/ClientGeneral.vue';
import BankAccounts from '@/views/provider/BankAccounts.vue';
import Contacts from '@/views/provider/Contacts.vue';
import InvoiceInfos from '@/views/provider/InvoiceInfos.vue';
import ClientQuoteInfo from './ClientQuoteInfo.vue';
import ClientUser from './ClientUser.vue'
import Addresses from '@/views/provider/Addresses.vue';
import ClientCreditHistory from './ClientCreditHistory.vue';
const [loading, toggleLoading] = useToggle()
const state = reactive({
  entity: null
})
const currentTab = ref(0)
const router = useRouter()
let preClientUrl = null
async function setEntity (entityId) {
  toggleLoading()
  state.entity = await EntityService.get(entityId)
  toggleLoading()
  document.querySelector('html').classList.add('overflow-y-hidden');
  preClientUrl = window.location.pathname + window.location.search + window.location.hash
  history.pushState(
    {},
    null,
    router.resolve({ name: 'client-id', params: { id: state.entity.id } }).href
  )
}
const emit = defineEmits(['closed'])
function reset () {
  document.querySelector('html').classList.remove('overflow-y-hidden');
  state.entity = null
  emit('closed')
  history.pushState(
    {},
    null,
    preClientUrl ?? router.resolve({ name: 'client' }).href
  )
  preClientUrl = null
}
function parentBind(props) {
  if(!state.entity) return null
  return {parentType: 'client', parentId: state.entity.id, parentProperty: props}
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
    :title="$gettext('View Client Detail')"
  >
    <template #append>
      <div class="form-close d-flex me-n4">
        <v-btn variant="text" size="small" @click="reset" color="primary">
          <VIcon icon="tabler-x" size="30" />
        </v-btn>
      </div>
    </template>
  </VCard>
  <v-row class="px-4 pt-4" v-if="state.entity">
    <v-col cols="12" :lg="4">
      <ClientGeneral :client="state.entity" @entitySubmitted="setEntity(state.entity.id)" @clientChanged="setEntity(state.entity.id)" />
    </v-col>
    <v-col cols="12" :lg="8">
      <VTabs
        v-model="currentTab"
        class="v-tabs-pill"
      >
        <VTab>{{ $gettext("General") }}</VTab>
        <VTab>{{ $gettext("Invoicing Information") }}</VTab>
        <VTab>{{ $gettext("Bank Accounts") }}</VTab>
        <VTab>{{ $gettext("Addresses") }}</VTab>
        <VTab>{{ $gettext("Credit History") }}</VTab>
      </VTabs>

      <VWindow v-model="currentTab" class="ma-n4 pa-4" >
        <VWindowItem :key="0" transition="fade-transition" reverse-transition="fade-transition">
          <ClientQuoteInfo 
            :parent="state.entity" 
            @entitySubmitted="setEntity(state.entity.id)" />

          <ClientUser 
            :parent="state.entity" class="mt-4"
            @entitySubmitted="setEntity(state.entity.id)" />
          
          <VCard :title="$gettext('Documents')" class="mt-4">
            <VCardText class="d-flex flex-column gap-y-4">
              <Uploader 
                v-model="state.entity.documents" 
                :parentBind="parentBind('document')"
              />
            </VCardText>
          </VCard>

          <Contacts 
            :parent="state.entity"
            :parentBind="parentBind('contact')"
            @entitySubmitted="setEntity(state.entity.id)"
          />
          
        </VWindowItem>
        <VWindowItem :key="1" transition="fade-transition" reverse-transition="fade-transition">
          <InvoiceInfos 
            :parent="state.entity" :parentBind="parentBind('invoiceInfo')"
            @entitySubmitted="setEntity(state.entity.id)"/>
        </VWindowItem>
        <VWindowItem :key="2"  transition="fade-transition" reverse-transition="fade-transition">
          <BankAccounts
            :parent="state.entity"  :parentBind="parentBind('bankAccount')"
            @entitySubmitted="setEntity(state.entity.id)"/>
        </VWindowItem>
        <VWindowItem :key="3" transition="fade-transition" reverse-transition="fade-transition">
          <Addresses :clientId="state.entity.id" />
        </VWindowItem>
        <VWindowItem :key="4" transition="fade-transition" reverse-transition="fade-transition">
          <ClientCreditHistory :client-id="state.entity.id" />
        </VWindowItem>
      </VWindow>
    </v-col>
  </v-row>
  
</div>
</template>
