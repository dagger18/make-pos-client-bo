<script setup>
import ClientService from '@/services/ClientService';
import { useAppStore } from '@/stores/appStore';
import { useGettext } from "vue3-gettext";
const { $gettext } = useGettext();
const props = defineProps({
  parent: {type: Object, default: () => {}}
})
const emit = defineEmits(['entitySubmitted'])
async function doAssignUser (user) {
  if(!user.id) return
  await ClientService.update(
    {
      id: props.parent.id, 
      assignedUsers: [
        ...props.parent.assignedUsers, user
      ]
    }
  )
  emit('entitySubmitted')
}
async function doRemoveUser (index) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to remove this user from this client? They will not be able to receive notifications and modify this client'),
    { color: 'warning' }
  )
  if (!confirmed) {
    return
  }
  props.parent.assignedUsers.splice(index, 1)
  await ClientService.update({
      id: props.parent.id, 
      assignedUsers: props.parent.assignedUsers
    })
  emit('entitySubmitted')
}
async function saveAccountManger (user) {
  const data = {
    id: props.parent.id, 
    accountManager: user
  }
  const findIndex = props.parent.assignedUsers.findIndex(u => u.id === user.id)
  if(findIndex !== -1) {
    props.parent.assignedUsers.splice(findIndex, 1)
  }
  data.assignedUsers = props.parent.assignedUsers
  await ClientService.update(data)
  emit('entitySubmitted')
}
</script>
<template>
  <VCard :title="$gettext('Account Manager')">
    <VContainer class="px-6 pt-0">
      <VRow class="mt-n6">
        <VCol cols="12" lg="4" >
          <VCard 
             rounded class="pa-2" variant="tonal">
            <UserListItem
              :user="props.parent.accountManager"
              class="px-1 py-2"
            >
              <template #action="user">
                <UserSelect
                  class="rounded pe-0" variant="plain" color="warning"
                  block :title="$gettext('Edit Account Manager')"
                  :excepts="[props.parent.accountManager]"
                  @selected="saveAccountManger"
                >
                  <template #activatorContent >
                    <VIcon size="21" :icon="'tabler-edit'" />
                  </template>
                </UserSelect>
              </template>
            </UserListItem>
          </VCard>
          
        </VCol>
      </VRow>
      <div class="text-disabled text-uppercase text-sm py-4 mt-4">{{ $gettext('Assigned Users') }}</div>
      <VRow>
        <VCol 
          cols="12" lg="4" 
          v-for="(user, index) in props.parent.assignedUsers"
          :key="user.id">
              <UserListItem :user="user" border rounded class="pa-2">
                <template #action="user">
                  <VBtn 
                    icon size="30" class="rounded" 
                    variant="text" color="warning"
                    @click="doRemoveUser(index)"
                  >
                    <VIcon size="21" :icon="'tabler-trash-x'" />
                  </VBtn>
                </template>
              </UserListItem>
        </VCol>
        <VCol 
          cols="12" lg="4" 
        >
        <UserSelect
          block variant="text" :title="$gettext('Assign User')" 
          class="h-100" :style="['min-height: 46px']"
          border color="secondary"
          :excepts="[props.parent.accountManager, ...props.parent.assignedUsers]"
          @selected="doAssignUser"
        >
          <template #activatorContent >
            <VIcon
              size="26"
              :icon="'tabler-user-plus'"
              class="me-2"
            />
            {{ $gettext('Assign User') }}
          </template>
        </UserSelect>
        </VCol>
      </VRow>
      
    </VContainer>
  </VCard>
</template>
