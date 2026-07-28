<script setup>
import Column from '@/components/chart/Column.vue';
import Pie from '@/components/chart/Pie.vue';
import AppTable from '@/components/table/AppTable.vue';
import { enums as ComponentType, findByValue as getComponentType } from '@/config/enums/ComponentType';
import {
makeDefaultEntity as componentDefaultEntity,
layout as componentLayout
} from '@/config/forms/report/Component';
import CommonService, { transformArray, transformPreSubmit } from '@/services/CommonService';
// ComponentService removed - freight-specific service
const ComponentService = null;
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
const props = defineProps({
  page: { type: Object, default: () => {} }
})
const components = ref([])
const componentMap = ref({})
async function reloadComponents() {
  const response = await ComponentService.list(`filter_page=${props.page.id}`)
  components.value = response.list
  components.value.forEach(component => {
    let vueComponent = null
    switch (component.type) {
      case ComponentType.Table: 
        vueComponent = AppTable; 
        break;
      case ComponentType.ColumnLine: 
        vueComponent = Column; 
        break;
      case ComponentType.Pie: 
        vueComponent = Pie; 
        break;
    }
    componentMap.value[component.id] = markRaw(vueComponent)
  })
}
onMounted(async () => {
  // todo: check racing condition here, oh boy
  await useAppStore().fetchList('users')
  reloadComponents()
})
const componentForm = ref(null)
const maxRow = computed(() => {
  if(!components.value || components.value.length === 0)
    return 100
  return (Math.max(...components.value.map(c => c.rowNumber)) ?? 0) + 100
})

function setEntity() {
  componentForm.value.setEntity()
}
defineExpose({
  setEntity
})
const rows = computed(() => {
  const rowMap = {}
  components.value.forEach(component => {
    if(!rowMap.hasOwnProperty(component.rowNumber)) {
      rowMap[component.rowNumber] = {
        'rowNumber': component.rowNumber,
        'components': []
      }
    }
    rowMap[component.rowNumber].components.push(component)
    rowMap[component.rowNumber].components.sort((a, b) => a.orderNumber - b.orderNumber)
  })
  return Object.values(rowMap).reverse()
})

function componentConfig(component) {
  return getComponentType(component.type).componentConfig(component.dataset)
}
function entityPreSubmit (reactedAntity) {
  let entity = JSON.parse(JSON.stringify(reactedAntity))
  console.log('after parse', entity)

  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  if(entity.series?.length > 0) {
    transformArray(entity,'series')
  }
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
  
  console.log('final object', JSON.parse(JSON.stringify(entity)))

  return entity
}
async function deleteComponent(id) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to delete this entity? This might result in data loss. You should delete all dependencies of this entity first.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    return
  }
  const result = await ComponentService.delete(id)
  reloadComponents()
}
const rowRefs = reactive([]);
function getRowRef(el, index) {
  rowRefs[index] = el;
}
function exportReport(component) {
  const { accessToken, user } = useAuthStore()
  const componentType = getComponentType(component.type)
  
  // check for table
  if(componentType.value === ComponentType.Table) {
    const params = rowRefs[component.id]
                    .buildParams(
                      false, 
                      {
                        export: true,
                        YXV0aFRva2Vu: accessToken,
                        ZW1haWw: user.email,
                      }
                    )
    const url = rowRefs[component.id].apiService.list(CommonService.serialize(params))
    window.open(url, '_blank')
  }
  
}
</script>
<template>
<VRow v-for="row in rows" class="pt-4">
  <VCol 
    v-for="component in row.components" 
    :cols="12"
    :lg="6"
    :xl="component.columnWidth"
  >
    <VCard
      :title="component.title ?? component.dataset.name"
    >
      <template #append>
        <VMenu>
          <template #activator="{ props }">
            <IconBtn
              density="compact"
              color="disabled"
              v-bind="props"
            >
              <VIcon icon="tabler-dots-vertical" />
            </IconBtn>
          </template>
          <VList>
            <VListItem 
              v-if="component.type === ComponentType.Table" 
              @click="exportReport(component)"
            >
              <VListItemTitle>{{ $gettext('Export') }}</VListItemTitle>
            </VListItem>
            <VListItem @click="componentForm.setEntity(component)">
              <VListItemTitle>{{ $gettext('Edit') }}</VListItemTitle>
            </VListItem>
            <VListItem
              @click="deleteComponent(component.id)"
              >
              <VListItemTitle>{{ $gettext('Delete') }}</VListItemTitle>
            </VListItem>
            <VListItem
              @click="componentForm.setEntity({
                page: page.id,
                rowNumber: row.rowNumber,
                orderNumber: component.orderNumber - 50
              })"
            >
              <VListItemTitle>{{ $gettext('Insert Component Left') }}</VListItemTitle>
            </VListItem>
            <VListItem 
              @click="componentForm.setEntity({
                page: page.id,
                rowNumber: row.rowNumber,
                orderNumber: component.orderNumber + 50
              })"
            >
              <VListItemTitle>{{ $gettext('Insert Component Right') }}</VListItemTitle>
            </VListItem>
            <VListItem
              @click="componentForm.setEntity({
                page: page.id,
                rowNumber: row.rowNumber + 100,
                orderNumber: 50
              })"
            >
              <VListItemTitle>{{ $gettext('Insert Component Top') }}</VListItemTitle>
            </VListItem>
            <VListItem
              @click="componentForm.setEntity({
                page: page.id,
                rowNumber: row.rowNumber - 100,
                orderNumber: 50
              })"
            >
              <VListItemTitle>{{ $gettext('Insert Component Bottom') }}</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>

      <VCardText class="mx-n4 mt-n2">
        <Component 
          :key="component.id"
          :is="componentMap[component.id]"
          v-bind="componentConfig(component)"
          :componentConfig="component"
          :ref="(el) => getRowRef(el, component.id)"
        >
        </Component>
      </VCardText>
    </VCard>
    
  </VCol>
</VRow>
<AppForm
  ref="componentForm"
  :layout="componentLayout"
  :entityName="$gettext('Component')"
  :makeDefaultEntity="componentDefaultEntity"
  :entityPreSubmit="entityPreSubmit"
  :service="ComponentService"
  :context="{
    page: page.id,
    orderNumber: 100,
    rowNumber: maxRow
  }"
  @entitySubmitted="reloadComponents"
/>
</template>
