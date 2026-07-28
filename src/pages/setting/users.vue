<script setup>
import { enums as UserStatus, getTitle } from '@/config/enums/UserStatus';
import { filterConfigs, headers } from '@/config/tables/User';
import EntityService from '@/services/UserService';
import UserForm from '@/views/user/UserForm.vue';
import { useAppStore } from '@/stores/appStore';
import { useGettext } from "vue3-gettext";
definePage({ 
  meta: { action: 'GET', subject: 'User' },
})
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const currentTab = 0
const { $gettext } = useGettext()
const buttons = computed(() => {
  return [
    {
      text: $gettext('Invite user'),
      func: form.value?.setInviteEntity
    }
  ]
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
async function toggleUserStatus(user) {
  await EntityService.update(
    {
      id: user.id, 
      status: user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
    }
  )
  table.value.fetchData()
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
    <template #avatar="{item}">
      <UserAvatar :user="item"/>
    </template>
    <template #fullName="{item}">
      <b>{{ (item.firstName ?? '') + ' ' + (item.lastName ?? '') }}</b>
    </template>
    <template #status="{ item }">
      <VSwitch 
        :modelValue="item.status === UserStatus.ACTIVE"
        color="success"
        v-if="item.status !== UserStatus.PENDING"
        @click="toggleUserStatus(item)"
      >
        <template #label>
          <span
            :class="{
              'text-success': item.status === UserStatus.ACTIVE
            }"
          >
            {{ getTitle(item.status) }}
          </span>
        </template>
      </VSwitch>
      <VSwitch 
        :modelValue="false"
        color="gray"
        v-else
      >
        <template #label>
          <span  class="text-warning">{{ getTitle(item.status) }}</span>
        </template>
      </VSwitch>
    </template>
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
        v-if="item.userGroup.name !== 'Admin'"
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
  <UserForm 
    ref="form" 
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
