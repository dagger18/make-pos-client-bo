<script setup>
import { permissionModules } from '@/config/enums/Permission';
const props = defineProps({
  modelValue: { type: Array, default: () => []}
})
const groupPermissions = ref([])
const openModules = reactive({
  'provider': [],
  'settings': []
})
const checkModules = reactive({
  'provider': 'unchecked',
  'settings': 'unchecked'
})
const pModules = permissionModules()
const setModuleCheckStatus = () => {
  pModules.forEach(pModule => {
    if(pModule.permissions.every(p => groupPermissions.value.includes(p.value))) {
      checkModules[pModule.value] = 'checked'
      return
    }
    if(pModule.permissions.some(p => groupPermissions.value.includes(p.value))) {
      checkModules[pModule.value] = 'indeterminate'
      return
    }
    checkModules[pModule.value] = 'unchecked'
  })
}
const doCheckAll = (pModule) => {
  pModule.permissions.forEach(p => {
    if(!groupPermissions.value.includes(p.value)) {
      groupPermissions.value.push(p.value)
    }
  })
  setModuleCheckStatus()
  openModules[pModule.value] = [pModule.value]
}
const doToggleAll = (pModule, toBoolean = true) => {
  pModule.permissions.forEach(p => {
    if(toBoolean) {
      if(!groupPermissions.value.includes(p.value)) {
        groupPermissions.value.push(p.value)
      }
    } else {
      groupPermissions.value = groupPermissions.value.filter(gp => gp !== p.value)
    }
  })
  
  setModuleCheckStatus()
  openModules[pModule.value] = [pModule.value]
}
const doTogglePermission = (permission) => {
  if(!groupPermissions.value.includes(permission)) {
    groupPermissions.value.push(permission)
  } else {
    groupPermissions.value = groupPermissions.value.filter(gp => gp !== permission)
  }
  setModuleCheckStatus()
}
onMounted(() => {
  groupPermissions.value = props.modelValue
  setModuleCheckStatus()
})
const emit = defineEmits(['update:modelValue'])
watch(() => groupPermissions, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })
</script>
<template>
<VRow>
  <VCol v-for="pModule in pModules" cols="12" lg="6">
  <VList 
    v-model:opened="openModules[pModule.value]" 
    border density="compact" nav
  >
    <VListGroup 
      :value="pModule.value" 
      >
      <template #activator="{ props }">
        <VListItem
          v-bind="props"
          :prepend-icon="'tabler-' + pModule.icon"
          :title="pModule.text"
        >
          <template #prepend>
            <VListItemAction start class="me-0">
              <VCheckbox
                v-show="checkModules[pModule.value] === 'indeterminate'"
                indeterminate color="primary" density="compact" 
                @click.prevent.stop="doToggleAll(pModule, true)"
              />
              <VCheckbox
                v-show="checkModules[pModule.value] !== 'indeterminate'"
                color="primary" density="compact"
                :modelValue="checkModules[pModule.value] === 'checked'"
                @click.prevent.stop="doToggleAll(pModule, checkModules[pModule.value] !== 'checked')"
              />
            </VListItemAction>
          </template>  
        </VListItem>
      </template>
      <VListItem
        v-for="(permission, pi) in pModule.permissions"
        :key="pi"
        :title="permission.title"
        class="ps-0 mb-0 permission-item"
      >
        <template #prepend="props">
          <VListItemAction start class="me-0">
            <VCheckbox
              :modelValue="groupPermissions.includes(permission.value)"
              color="primary"
              density="compact"
              @click="doTogglePermission(permission.value)"
            />
          </VListItemAction>
        </template>  
      </VListItem>
    </VListGroup>
  </VList>
  </VCol>
</VRow>
</template>

<style scoped>
.permission-item {
  min-block-size: 28px !important;
  padding-block: 0 !important;
}

.permission-item :deep(.v-list-item__content) {
  padding-block: 2px;
}

.permission-item :deep(.v-checkbox) {
  transform: scale(0.82);
  transform-origin: left center;
}
</style>
