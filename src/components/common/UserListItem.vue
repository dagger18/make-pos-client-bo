<script setup>
import { printFullName } from '@/services/UserService';
const props = defineProps({
  user: {type: Object, default: () => {}}
})
</script>
<template>
<VListItem>
  <template #prepend>
    <UserAvatar :user="user"/>
  </template>

  <VListItemTitle class="font-weight-medium">
    {{ printFullName(user) }}
  </VListItemTitle>
  
  <template #append>
    <slot name="action"></slot>
  </template>
</VListItem>

</template>
