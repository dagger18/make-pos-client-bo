<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/Provider';
import { transformArray, transformPreSubmit } from '@/services/CommonService';
import EntityService from '@/services/ProviderService';
const props = defineProps({
  currentType: { type: Object, default: () => {} }
})
const form = ref(null)

const duplicates = ref([])
const duplicateDialogOpen = ref(false)
const pendingSubmitFn = ref(null)

function entityPreForm (entity) {
  entity.type = props.currentType.value
  return entity
}
function entityPreSubmit (entity) {
  transformPreSubmit(entity)

  if (entity.contacts && entity.contacts.length > 0) {
    transformArray(entity, 'contacts')
  }

  if (entity.invoiceInfos && entity.invoiceInfos.length > 0) {
    transformArray(entity, 'invoiceInfos')
  }

  if (entity.bankAccounts && entity.bankAccounts.length > 0) {
    transformArray(entity, 'bankAccounts')
  }

  return entity
}

async function checkAndSubmit(originalSubmit, entity) {
  const name = entity?.name ?? ''
  const taxNumber = entity?.taxNumber ?? ''
  if (!name) { await originalSubmit(); return }

  const found = await EntityService.checkDuplicates(name, taxNumber)
  if (found && found.length > 0) {
    duplicates.value = found
    pendingSubmitFn.value = originalSubmit
    duplicateDialogOpen.value = true
  } else {
    await originalSubmit()
  }
}

async function proceedDespiteDuplicates() {
  duplicateDialogOpen.value = false
  await pendingSubmitFn.value()
}

function setEntity(entity = null) {
  form.value.setEntity(entity)
}
defineExpose({
  setEntity
})
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('Provider')"
    :makeDefaultEntity="makeDefaultEntity"
    :entityPreForm="entityPreForm"
    :entityPreSubmit="entityPreSubmit"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="$emit('entitySubmitted')"
  >
    <template #SubmitBtn="{ entity }">
      <SubmitBtn
        color="primary"
        @click="checkAndSubmit(() => form.submit(), entity)"
        class="mr-2"
      >
        <template v-slot:prepend>
          <v-icon icon="tabler-device-floppy" size="24"></v-icon>
        </template>
        {{ $gettext('Save') }}&nbsp;{{ $gettext('Provider') }}
      </SubmitBtn>
    </template>
  </AppForm>

  <VDialog v-model="duplicateDialogOpen" max-width="520">
    <VCard :title="$gettext('Possible Duplicate Detected')">
      <VCardText>
        <p class="mb-3">{{ $gettext('The following existing providers have a similar name or the same tax number:') }}</p>
        <VList density="compact">
          <VListItem
            v-for="dup in duplicates"
            :key="dup.id"
            :title="dup.name"
            :subtitle="`${dup.code ?? ''} · ${dup.country ?? ''} · Tax: ${dup.taxNumber ?? '—'}`"
          />
        </VList>
        <p class="mt-3 text-medium-emphasis text-caption">{{ $gettext('You can select an existing record or continue creating a new one.') }}</p>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="duplicateDialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="warning" @click="proceedDespiteDuplicates">{{ $gettext('Create Anyway') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
