<script setup>
import { enums as mode } from '@/config/enums/CustomInfoMode';
import { layout, makeDefaultEntity } from '@/config/forms/ClientQuoteInfo';
import EntityService from '@/services/ClientService';
import { printNullable } from '@/services/CommonService';
// InvoiceInfoService removed - freight-specific service
const InvoiceInfoService = null;
const props = defineProps({
  parent: {type: Object, default: () => {}}
})
const generalProps = [
  {'key': 'company','text': $gettext('Company Name')},
  {'key': 'phone','text': $gettext('Phone')},
  {'key': 'email','text': $gettext('Email')},
  {'key': 'address','text': $gettext('Address')},
  {'key': 'contactName','text': $gettext('Contact Name')},
  {'key': 'taxNumber','text': $gettext('Tax Number')},
]
const customInfoComputed = computed(() => {
  switch(props.parent.customInfoMode) {
    case mode.GeneralInfo: return {...props.parent.defaultInvoiceInfo, ...props.parent}
    case mode.InvoiceInfo: return props.parent.defaultInvoiceInfo
    case mode.CustomInfo: return props.parent.customInfo ?? props.parent
  }
})
const form = ref(null)
const [modal, toggleModal] = useToggle()
function edit() {
  toggleModal()
  nextTick(() => {
    form.value.setEntity(props.parent)
  })
}
function entityPreSubmit (entity) {
  console.log(JSON.parse(JSON.stringify(entity)))
  if(entity.customInfoMode !== mode.CustomInfo) {
    return entity
  }
  if(entity.customInfo) {
    if(entity.customInfo.id) {
      //edit
      InvoiceInfoService.update({...entity.customInfo, parentType: 'client', parentId: entity.id, parentProperty: 'customInfo'})
      delete entity.customInfo
    } else {
      // new
    }
  }
  
  return entity
}
const emit = defineEmits(['entitySubmitted'])
function entitySubmitted() {
  toggleModal()
  emit('entitySubmitted')
}
</script>
<template>
<AppCardActions :title="$gettext('Quote information')" :no-actions="true">
  <template #before-actions>
    <VBtn
      prepend-icon="tabler-edit"
      size="small"
      @click="edit"
    >
      {{ $gettext("Edit") }}
    </VBtn>
  </template>
  <VContainer  class="px-6 pt-0">
    <VRow>
      <VCol v-for="generalProp in generalProps" cols="12" lg="4">
        <span class="text-h6 me-2">{{ generalProp.text }}:</span>
        <span >
          {{ printNullable(customInfoComputed[generalProp.key]) }}
        </span>
      </VCol>
    </VRow>
  </VContainer>
</AppCardActions>
<VDialog
  v-model="modal" persistent max-width="800"
>
  <DialogCloseBtn @click="modal = !modal" />
  <VCard :title="$gettext('Quote information')">
    <VCardText class="pa-0">
      <AppForm
        :layout="layout"
        :isDialog="false"
        :makeDefaultEntity="makeDefaultEntity"
        :entityPreSubmit="entityPreSubmit"
        :service="EntityService"
        ref="form"
        @entitySubmitted="entitySubmitted"
      />
    </VCardText>
  </VCard>
</VDialog>
</template>
