<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
// ShipmentService removed - freight-specific service
const ShipmentService = null;
import { useAppStore } from '@/stores/appStore';
import { $gettext } from '@/utils/api';
import { can } from '@layouts/plugins/casl';
const props = defineProps({
  shipment: {type: Object, default: () => {}}
})
const table = ref(null)
const items = computed(() => {
  const users = []
  users.push({
    user: props.shipment.accountManager,
    role: $gettext('Account Manager')
  })
  if(props.shipment.accountManager.id !== props.shipment.createdBy.id) {
    users.push({
      user: props.shipment.createdBy,
      role: $gettext('Creator')
    })
  }
  ;(props.shipment.manageAllUsers ?? []).forEach(user => {
    // shady 2nd admin
    if(user.id === 2) return
    const usersIdList = users.map(u => { return u.user.id })
    if(usersIdList.includes(user.id)) return
    users.push({
      user,
      role: $gettext('Manage All Shipments')
    })
  })
  props.shipment.assignedUsers.forEach(user => {
    // shady 2nd admin
    if(user.id === 2) return
    const usersIdList = users.map(u => { return u.user.id })
    if(usersIdList.includes(user.id)) return
    users.push({
      user,
      role: $gettext('Assigned User'),
      removeable: true
    })
  })

  return users
})
const headers = [
  { 
    key: 'user', 
    text: $gettext(''), 
    sortable: false,
    renderAvatar: true,
    headerClass: 'text-center',
    bodyClass: 'text-center',
    showName: false
  },
  {
    key: 'user', 
    text: $gettext('User'),
    renderObject(item) {
      return item.user.firstName + ' ' + item.user.lastName
    }
  },
  {
    key: 'user', 
    text: $gettext('Role'),
    renderObject(item) {
      return item.user.userGroup?.name ?? ''
    }
  },
  {
    key: 'role', 
    text: $gettext('Subscription Source'),
  },
  { 
    text: $gettext('Action'), 
    sortable: false, 
    renderSlot: 'action', 
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4' 
  }
]
const emit = defineEmits(['shipmentChanged'])
async function doAssignUser (user) {
  if(!user.id) return
  await ShipmentService.update(
    {
      id: props.shipment.id, 
      assignedUsers: [
        ...props.shipment.assignedUsers, user
      ]
    }
  )
  emit('shipmentChanged')
}
async function removeUser (userId, buttonComponent) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to remove this user from shipment subscribers?'),
    { color: 'warning' }
  )
  if (!confirmed) {
    buttonComponent.disabled = false
    return
  }
  buttonComponent.addToQueuingList()
  let users = JSON.parse(JSON.stringify(toRaw(props.shipment.assignedUsers)))
  const index = users.findIndex(u => u.id === userId)
  users.splice(index, 1)
  await ShipmentService.update(
    {
      id: props.shipment.id, 
      assignedUsers: users
    }
  )
  emit('shipmentChanged')
}
const shipmentEditable = computed(() => {
  return props.shipment 
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
})
</script>
<template>
<AppTableInline
  ref="table"
  :headers="headers"
  :items="items"
  class="mt-n4"
>
  <template #title>
    <div class="font-weight-bold text-uppercase d-flex align-center h-100">
      {{ $gettext('Subscribers') }}
    </div>
  </template>
  <template #buttons>
    <UserSelect
      v-if="shipmentEditable && can('PUT_AssignedUsers', 'Shipment')"
      block :title="$gettext('Assign User')"
      :excepts="items.map(item => {return item.user})"
      @selected="doAssignUser" size="small"
    >
      <template #activatorContent >
        <VIcon
          size="18"
          :icon="'tabler-user-plus'"
          class="me-2"
        />
        {{ $gettext('Assign User') }}
      </template>
    </UserSelect>
  </template>
  
  <template #action="{ item }">
    <SubmitBtn
      v-if="item.removeable && shipmentEditable && can('PUT_AssignedUsers', 'Shipment')"
      @click="removeUser(item.user.id, $refs['delete-' + item.id])"
      :title="$gettext('Remove User')"
      class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
      :autoQueue="false"
      :ref="'delete-' + item.id"
      size="x-small"
    >
      <VIcon icon="tabler-trash" size="18"/>
    </SubmitBtn>
  </template>
</AppTableInline>
</template>
