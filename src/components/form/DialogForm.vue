<script setup>
const props = defineProps({
  modelValue: {type: Object, default: () => {}},
  layout: {type: Function, default: null},
  apiService: {type: Object, default: () => {}},
  entityPreSubmit: {type: Function, default: null},
})
const form = ref(null)
const menu = ref(false)
function setForm(manuallyOpen = false) {
  if(manuallyOpen) {
    menu.value = true
  }
  nextTick(() => {
    if(menu.value) {
      form.value.setEntity(props.modelValue)
    }
  })
  
}
const slots = useSlots()
const hasSlot = (name) => {
  return !!slots[name];
}
const attrs = useAttrs()
defineExpose({
  setForm
})
</script>
<template>
  <VDialog
    v-model="menu"
    @update:modelValue="setForm"
    :close-on-content-click="false"
    max-width="600" persistent
  >
    <DialogCloseBtn @click="menu = !menu" />
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
      <VBtn v-if="!hasSlot('activator')"
        v-bind="props" 
        variant="text" size="x-small" density="compact" :class="attrs.class ?? 'mt-n1'" :ripple="false">
        <VIcon icon="tabler-pencil" size="16"/>
      </VBtn>
    </template>

    <VCard>
      <AppForm
        :layout="layout"
        ref="form" :isDialog="false"
        :service="apiService"
        :miniActionButtons="true"
        :updateEntityMethod="'update'"
        :entityPreSubmit="entityPreSubmit"
        @entitySubmitted="$emit('entitySubmitted', $event) ; menu = false"
      >
        <template #SubmitBtn>
          <slot name="SubmitBtn" :form="form" />
          <SubmitBtn
            color="primary" class="mr-2" size="small"
            @click="form.submit"
            v-if="!hasSlot('SubmitBtn')"
          >
            <template v-slot:prepend>
              <v-icon icon="tabler-device-floppy" size="24"></v-icon>
            </template>
            {{ $gettext('Save') }}
          </SubmitBtn>
        </template>
      </AppForm>
    </VCard>
  </VDialog>
</template>
