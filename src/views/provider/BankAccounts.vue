<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/BankAccount';
// BankAccountService removed - freight-specific service
const EntityService = null;
import ClientService from '@/services/ClientService';
import { printNullable } from '@/services/CommonService';
// ProviderService removed - freight-specific service
const ProviderService = null;
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
    form.value.setEntity(entity)
  })
}
function entityPreForm (entity) {
  return Object.assign(JSON.parse(JSON.stringify(props.parentBind)), entity)
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
async function setDefaultEntity(defaultBankAccount) {
  await parentService.update({id: props.parent.id, defaultBankAccount})
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
function usedInInvoiceInfo(bankAccount) {
  return props.parent.invoiceInfos.some(ii => ii.bankAccount && ii.bankAccount.id === bankAccount.id)
}
</script>
<template>
  <AppCardActions :title="$gettext('Bank Accounts')" :noActions="true" class="mt-4">
    <template #before-actions>
      <VBtn
        prepend-icon="tabler-plus"
        size="small"
        @click="editEntity()"
      >
        {{ $gettext("New Bank Account") }}
      </VBtn>
    </template>
    <VCardText class="d-flex flex-column gap-y-4">
      <VCard
        v-for="entity in parent.bankAccounts.sort(function(a, b){return b.id === parent.defaultBankAccount.id ? 1 : -1})"
        :key="entity.id" :border="true"
        flat
      >
        <VCardText class="d-flex flex-column pa-4 gap-y-2">
          <div class="d-flex justify-space-between align-center text-body-2 mb-n1">
            <span><span class="font-weight-medium">{{ $gettext("Bank Name") }}:</span> {{ entity.bankName }}</span>
            <v-spacer />
            <VBtn
              v-if="entity.id === parent.defaultBankAccount.id"
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
                @click="setDefaultEntity(entity.id)"
              >
              {{ $gettext("Set default") }}
              </SubmitBtn>
              <SubmitBtn
                v-if="usedInInvoiceInfo(entity)"
                variant="text" size="small" class="px-0 me-1" color="secondary"
              >
                <VIcon icon="tabler-trash" size="21"/>
                <VTooltip open-on-focus location="top" activator="parent">
                  {{ $gettext('Used in some invoice information') }}
                </VTooltip>
              </SubmitBtn>
              <SubmitBtn
                v-else
                variant="text" size="small" class="px-0 me-1" color="error"
                :ref="'delete-entity' + entity.id"
                @click="deleteEntity(entity.id, $refs['delete-entity' + entity.id])"
                :autoQueue="false"
              >
                <VIcon icon="tabler-trash" size="21"/>
              </SubmitBtn>
            </template>
            <VBtn
              variant="tonal"
              size="small"
              @click="editEntity(entity)"
            >
            {{ $gettext("Edit") }}
            </VBtn>
          </div>
          
          <span><span class="font-weight-medium">{{ $gettext("Branch") }}:</span> {{ printNullable(entity.branch) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Account Name") }}:</span> {{ printNullable(entity.accountName) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Account Number") }}:</span> {{ printNullable(entity.accountNumber) }}</span>
          <span><span class="font-weight-medium">{{ $gettext("Swift Code") }}:</span> {{ printNullable(entity.swiftCode) }}</span>
        </VCardText>
      </VCard>
    </VCardText>
  </AppCardActions>
  <VDialog
    v-model="modal"
    max-width="800"
  >
    <DialogCloseBtn @click="modal = !modal" />
    <VCard :title="$gettext('Bank Account')">
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
