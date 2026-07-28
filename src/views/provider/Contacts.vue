<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/Contact';
import ClientService from '@/services/ClientService';
import { printNullable } from '@/services/CommonService';
import EntityService from '@/services/ContactService';
import ProviderService from '@/services/ProviderService';
import { useAppStore } from '@/stores/appStore';
import { useGettext } from 'vue3-gettext';
const { $gettext } = useGettext()
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
async function setDefaultEntity(defaultContact) {
  await parentService.update({id: props.parent.id, defaultContact})
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
  <AppCardActions :title="$gettext('Contact Person')" :noActions="true" class="mt-4">
    <template #before-actions>
      <VBtn
        prepend-icon="tabler-plus"
        size="small"
        @click="editEntity()"
      >
        {{ $gettext("New Contact") }}
      </VBtn>
    </template>
    <VCardText class="d-flex flex-column gap-y-4">
      <VCard
        v-for="entity in parent.contacts.sort(function(a, b){return b.id === parent.defaultContact.id ? 1 : -1})"
        :key="entity.id" :border="true"
        flat
      >
        <VCardText class="d-flex flex-column pa-4 gap-y-1">
          <div class="d-flex justify-space-between align-center text-body-2 mb-n1">
            <span>
              <span class="font-weight-medium">{{ $gettext("Name") }}:</span>
              {{ printNullable(entity.firstName) }} {{ printNullable(entity.lastName) }}
              <VChip v-if="!entity.isActive" size="x-small" color="warning" class="ms-1">{{ $gettext('Inactive') }}</VChip>
            </span>
            <v-spacer />
            <VBtn
              v-if="entity.id === parent.defaultContact.id"
              variant="text" size="small" disabled color="success"
            >
              <VIcon icon="tabler-clipboard-check" size="21"/>&nbsp;
              {{ $gettext("Default") }}
            </VBtn>
            <template v-else>
              <SubmitBtn
                variant="text" size="small" color="warning" class="px-2"
                @click="setDefaultEntity(entity.id)"
              >
              {{ $gettext("Set default") }}
              </SubmitBtn>
              <SubmitBtn
                variant="text" size="small" color="error" class="px-0 me-1"
                :ref="'delete-entity' + entity.id"
                @click="deleteEntity(entity.id, $refs['delete-entity' + entity.id])"
                :autoQueue="false"
              >
                <VIcon icon="tabler-trash" size="21"/>
              </SubmitBtn>
            </template>
            <VBtn
              variant="tonal" size="small"
              @click="editEntity(entity)"
            >
            {{ $gettext("Edit") }}
            </VBtn>
          </div>
          <span><span class="font-weight-medium">{{ $gettext("Title") }}:</span> {{ printNullable(entity.title) }}</span>
          <span>
            <span class="font-weight-medium">{{ $gettext("Phone") }}:</span> {{ printNullable(entity.phone) }}
            <span class="ms-2">
              <VIcon v-if="entity.receivesInvoice" size="14" icon="tabler-receipt" :title="$gettext('Receives Invoices')" />
              <VIcon v-if="entity.receivesTracking" size="14" icon="tabler-radar" :title="$gettext('Receives Tracking')" class="ms-1" />
              <VIcon v-if="entity.receivesArrival" size="14" icon="tabler-bell" :title="$gettext('Receives Arrivals')" class="ms-1" />
            </span>
          </span>
          <span><span class="font-weight-medium">{{ $gettext("Email") }}:</span> {{ printNullable(entity.email) }}</span>
        </VCardText>
      </VCard>
    </VCardText>
  </AppCardActions>
  <VDialog
    v-model="modal" persistent
    max-width="800"
  >
    <DialogCloseBtn @click="modal = !modal" />
    <VCard :title="$gettext('Contact Person')">
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
