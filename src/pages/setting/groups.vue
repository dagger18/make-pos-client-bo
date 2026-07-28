<script setup>
import { AdminGroupId } from '@/config/enums/AppEnums';
import { filterConfigs, headers } from '@/config/tables/UserGroup';
import EntityService from '@/services/UserGroupService';
import UserGroupForm from '@/views/user/UserGroupForm.vue';
import { useGettext } from "vue3-gettext";
definePage({ 
  meta: { action: 'GET', subject: 'Group', navActiveLink: 'setting-users' },
})
const getFilterConfigs = () => filterConfigs()
const table = ref(null)
const form = ref(null)
const currentTab = 1
const { $gettext } = useGettext()
const buttons = computed(() => {
  return [
    {
      text: $gettext('Add group'),
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
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :pageTitle="$gettext('User & Group')"
  >
    <template v-slot:beforeTable>
      <VTabs v-model="currentTab" class="my-4">
        <v-tab
          @click="$router.push({ name: 'setting-users' })">
          {{ $gettext("Users") }}
        </v-tab>
        <v-tab
          @click="$router.push({ name: 'setting-groups' })">
          {{ $gettext("Group") }}
        </v-tab>
      </VTabs>
    </template>
    <!-- Displayed Items -->
    <template #action="{ item }">
      <template v-if="item.id !== AdminGroupId">
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
    </template>
  </AppTable>
  <UserGroupForm 
    ref="form" 
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
