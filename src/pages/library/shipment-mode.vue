<script setup>
import { filterConfigs, headers } from '@/config/tables/library/ShipmentMode';
import EntityService from '@/services/library/ShipmentModeService';
import { useAppStore } from '@/stores/appStore';
import ShipmentModeForm from '@/views/library/ShipmentModeForm.vue';
import { useLibraryHeader } from '@/composables/useLibraryHeader';
import { useGettext } from 'vue3-gettext';
definePage({
  meta: { action: 'GET', subject: 'ShipmentMode', navActiveLink: 'library-package-type-transport-type' },
})
const { $gettext } = useGettext()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const buttons = computed(() => [{ text: $gettext('Add Shipment Mode'), func: form.value?.setEntity }])
const { buttons: headerButtons } = useLibraryHeader()
watch(buttons, val => { headerButtons.value = val }, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :hideTitle="true"
  >
    <template #action="{ item }">
      <v-btn
        @click="editEntity(item.id)"
        :title="$gettext('edit')"
        class="grey--text mx-0" variant="text"
        size="x-small"
      >
        <VIcon icon="tabler-pencil" size="18"/>
      </v-btn>
      <SubmitBtn
        @click="table.handleDelete(item, $refs['delete-' + item.id])"
        :title="$gettext('delete')"
        class="grey--text mx-0 ml-n2" variant="text"
        :autoQueue="false"
        :ref="'delete-' + item.id"
        size="x-small"
      >
        <VIcon icon="tabler-trash" size="18"/>
      </SubmitBtn>
    </template>
  </AppTable>
  <ShipmentModeForm 
    ref="form" 
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
