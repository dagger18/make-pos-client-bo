<script setup>
import { filterConfigs, headers } from '@/config/tables/report/Dataset';
import EntityService from '@/services/DatasetService';
import DatasetForm from '@/views/report/DatasetForm.vue';
import { useAppStore } from '@/stores/appStore';
definePage({ 
  meta: { action: 'GET', subject: 'Report' },
})
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const buttons = computed(() => {
  return [
    {
      text: $gettext('Add Dataset'),
      func: form.value?.setEntity
    }
  ]
})

async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
const reportTabList = [
  {slug: 'dataset', title: $gettext('Dataset')},
  {slug: 'shipment', title: $gettext('Shipment')},
]
</script>
<template>
  <AppTable
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
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
  <DatasetForm 
    ref="form" 
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
