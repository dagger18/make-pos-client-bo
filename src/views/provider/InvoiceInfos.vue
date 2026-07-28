<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/InvoiceInfo';
import ClientService from '@/services/ClientService';
import { printNullable } from '@/services/CommonService';
import EntityService from '@/services/InvoiceInfoService';
import ProviderService from '@/services/ProviderService';
import { useAppStore } from '@/stores/appStore';
const props = defineProps({
  parent: { type: Object, default: () => {}},
  parentBind: { type: Object, default: () => {} },
})
const [modal, toggleModal] = useToggle()
const form = ref(null)
const emit = defineEmits([
  'entitySubmitted',
])

function editEntity(entity = null) {
  toggleModal()
  nextTick(() => {
    console.log('iset entity', entity)
    form.value.setEntity(entity)
  })
}
function entityPreForm (entity) {
  entity.bankAccounts = props.parent.bankAccounts
  entity = Object.assign(JSON.parse(JSON.stringify(props.parentBind)), entity)
  return entity
}
function entitySubmitted() {
  toggleModal()
  emit('entitySubmitted')
}
let parentService = ''
switch(props.parentBind.parentType) {
  case 'client': parentService = ClientService; break;
  case 'provider': parentService = ProviderService; break;
}
async function setDefaultEntity(defaultInvoiceInfo) {
  await parentService.update({id: props.parent.id, defaultInvoiceInfo})
  emit('entitySubmitted')
}
async function deleteEntity(id, btn) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to delete this entity? This might result in data loss. You should delete all dependencies of this entity first.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    btn[0].disabled = false
    return
  }
  btn[0].addToQueuingList()
  const result = await EntityService.delete(id, props.parentBind)
  if (result) {
    emit('entitySubmitted')
  }
}
</script>
<template>
  <AppCardActions :title="$gettext('Invoicing Informations')" :noActions="true">
    <template #before-actions>
      <VBtn
        prepend-icon="tabler-plus"
        size="small"
        @click="editEntity()"
      >
        {{ $gettext("New Info") }}
      </VBtn>
    </template>
    <VCardText class="d-flex flex-column gap-y-4">
      <VCard
        v-for="info in parent.invoiceInfos.sort(function(a, b){return b.id === parent.defaultInvoiceInfo.id ? 1 : -1})"
        :key="info.id" :border="true"
        flat
      >
        <VCardText class="d-flex flex-column pa-4 gap-y-2">
          <div class="d-flex justify-space-between align-center text-body-2 mb-n1">
            <span>
              <span class="font-weight-medium">{{ $gettext("Company Name") }}:</span>
              {{ info.company }}
            </span>
            <v-spacer />
            <VBtn
              v-if="info.id === parent.defaultInvoiceInfo.id"
              variant="text"
              size="small"
              disabled color="success"
            ><VIcon icon="tabler-clipboard-check" size="21"/>&nbsp;
            {{ $gettext("Default") }}
            </VBtn>
            <template v-else>
              <SubmitBtn
                variant="text"
                size="small"
                color="warning"
                class="px-2"
                @click="setDefaultEntity(info.id)"
              >
              {{ $gettext("Set default") }}
              </SubmitBtn>
              <SubmitBtn
                variant="text"
                size="small"
                color="error"
                class="px-0 me-1"
                :ref="'delete-invoice-info' + info.id"
                @click="deleteEntity(info.id, $refs['delete-invoice-info' + info.id])"
                :autoQueue="false"
              >
              <VIcon icon="tabler-trash" size="21"/>
              </SubmitBtn>
            </template>
            <VBtn
              variant="tonal"
              size="small"
              @click="editEntity(info)"
            >
            {{ $gettext("Edit") }}
            </VBtn>
          </div>
          
          <span><span class="font-weight-medium">{{ $gettext("Email") }}:</span> {{ printNullable(info.email) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Phone") }}:</span> {{ printNullable(info.phone) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Address") }}:</span> {{ printNullable(info.address) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Contact Name") }}:</span> {{ printNullable(info.contactName) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Tax Number") }}:</span> {{ printNullable(info.taxNumber) }}</span>
          <span v-if="info.bankAccount">
            <span class="font-weight-medium">{{ $gettext("Bank Account") }}:</span> <span class=" text-primary">{{ info.bankAccount.bankName }} - {{ printNullable(info.bankAccount.accountName) }}</span>
          </span>
          <span v-else class="text-error">Missing Bank Account<br>This should not happen, please contact admin</span>
        </VCardText>
      </VCard>
    </VCardText>
  </AppCardActions>
  <VDialog
    v-model="modal"
    max-width="800"
  >
    <DialogCloseBtn @click="toggleModal(false)" />
    <VCard :title="$gettext('Invoicing Information')">
      <VCardText class="pa-0">
        <AppForm
          :layout="layout"
          :isDialog="false"
          :makeDefaultEntity="makeDefaultEntity"
          :entityPreForm="entityPreForm"
          :service="EntityService"
          ref="form"
          @entitySubmitted="entitySubmitted()"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
