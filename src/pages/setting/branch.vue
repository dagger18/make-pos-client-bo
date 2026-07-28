<script setup>
import { filterConfigs, headers } from '@/config/tables/Branch';
import EntityService from '@/services/BranchService';
import BranchForm from '@/views/setting/BranchForm.vue';
import { useGettext } from 'vue3-gettext';
definePage({
  meta: { action: 'MANAGE', subject: 'Branch' },
})
const { $gettext } = useGettext()
const table = ref(null)
const form = ref(null)
const buttons = computed(() => {
  return [
    {
      text: $gettext('Add Branch'),
      func: form.value?.setEntity
    }
  ]
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="EntityService"
    ref="table"
    :pageTitle="$gettext('Branches')"
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
  <BranchForm
    ref="form"
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
