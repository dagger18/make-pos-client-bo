<script setup>
// ProviderService removed - freight-specific service
const ProviderService = null;
import { useAppStore } from '@/stores/appStore';
import { useGettext } from "vue3-gettext";
const { $gettext } = useGettext();
const props = defineProps({
  parent: {type: Object, default: () => {}}
})
const emit = defineEmits(['entitySubmitted'])
async function doAssignUser (user) {
  if(!user.id) return
  await ProviderService.update(
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
    $gettext('Do you want to remove this user from this provider? They will not be able to see this provider'),
    { color: 'warning' }
  )
  if (!confirmed) {
    return
  }
  props.parent.assignedUsers.splice(index, 1)
  await ProviderService.update({
      id: props.parent.id,
      assignedUsers: props.parent.assignedUsers
    })
  emit('entitySubmitted')
}
</script>
<template>
  <VCard :title="$gettext('Assigned Users')">
    <VContainer class="px-6 pt-0">
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
        <VCol cols="12" lg="4">
          <UserSelect
            block variant="text" :title="$gettext('Assign User')"
            class="h-100" :style="['min-height: 46px']"
            border color="secondary"
            :excepts="[...props.parent.assignedUsers]"
            @selected="doAssignUser"
          >
            <template #activatorContent>
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
