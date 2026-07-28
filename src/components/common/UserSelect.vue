<script setup>
import { enums as UserStatus } from '@/config/enums/UserStatus';
import { useAppStore } from '@/stores/appStore';
const [ dialog, toggleDialog ] = useToggle()
const props = defineProps({
  title: {type: String, default: ''},
  excepts: {type: Array, default: () => []},
})
const users = computed(() => {
  return useAppStore()
    .getList('users')
    .filter(
      user => user.status == UserStatus.ACTIVE && props.excepts && !props.excepts.map(({id}) => id).includes(user.id)
    )
})
const emit = defineEmits('selected')
const selectedUser = ref(null)
function doAction(action = 'cancel') {
  if(action === 'save'){
    emit('selected', Object.assign({}, selectedUser.value))
  }
  toggleDialog() ; 
  selectedUser.value = null
}
</script>
<template>
  <VDialog
    v-model="dialog"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog Activator -->
    <template #activator="{ props: {onClick} }">
      <VBtn v-bind="{onClick, ...$attrs}">
        <slot name="activatorContent"></slot>
      </VBtn>
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="toggleDialog()" />

    <!-- Dialog Content -->
    <VCard :title="title">
      <VCardText>
        <VSelect v-model="selectedUser" :items="users" return-object>
          <template v-slot:item="{item, props}">
            <UserListItem :user="item.raw" v-bind="props" />
          </template>
          <template v-slot:selection="{ item, index }">
            <UserListItem :user="item.raw" />
          </template>
        </VSelect>
      </VCardText>

      <VCardText class="d-flex gap-3 flex-wrap">
        <VBtn @click="doAction('save')">
          {{ $gettext('Save') }}
        </VBtn>
        <VBtn
          color="secondary"
          variant="tonal"
          @click="doAction('cancel')"
        >
          {{ $gettext('Cancel') }}
        </VBtn>
        
      </VCardText>
    </VCard>
  </VDialog>
</template>
