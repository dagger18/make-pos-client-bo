<script setup>
import { getList as getPageTypes } from '@/config/enums/PageType';
import PageService from '@/services/PageService';
import PageView from './PageView.vue';
const props = defineProps({
  reportType: { type: String, default: 'report-shipment'}
})
const pages = ref([])
const [dragging, toggleDragging] = useToggle()
const currentPage = ref(0)
const components = ref([])
async function refreshPageList() {
  const response = await PageService.list('sort_asc=orderNumber&filter_type=' + props.reportType)
  pages.value = response.list
  if(!currentPage.value && pages.value.length > 0) {
    currentPage.value = pages.value[0].id
  }
}

onMounted(() => {
  refreshPageList()
})
async function onDragEnd() {
  toggleDragging(false)
  await PageService.reOrder({pages: pages.value.map(p => p.id)})
}

</script>
<template>
<VCard
  class="form-title py-2 px-4"
>
<VTabs :modelValue="reportType" class="v-tabs-pill ms-n6">
  <v-tab
    v-for="tab in getPageTypes"
    :value="tab.value"
    @click="$router.push({ 
      name: tab.value
    })">
    {{ tab.title }}
  </v-tab>
</VTabs>
</VCard>
<div class="d-flex">
  <VTabs
    :modelValue="currentPage" 
    class="mt-1 flex-grow-1"
  >
  <Draggable
    class="d-flex"
    v-bind="{
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost',
        direction: 'horizontal'
      }"
    v-model="pages"
    @start="toggleDragging(true)"
    @end="onDragEnd"
    item-key="order"
  >
    <template #item="{element}">
      <v-tab :value="element.id" :key="element.id" @click="currentPage=element.id">
        {{element.name}}
      </v-tab>
    </template>
  </Draggable>
  </VTabs>
  <DialogForm
    :apiService="PageService"
    :modelValue="{
      name: '',
      type: reportType
    }" 
    :layout="() => [[[
        { name: 'name', text: $gettext('Name') },
      ]]]"
    @entitySubmitted="refreshPageList"
  >
    <template #activator="props">
      <VBtn 
        variant="tonal" size="small"
        class="mt-3"
        v-bind="props"
      >
        <VIcon icon="tabler-plus" size="18" class="me-2"/>
        {{ $gettext('Add Page') }}
      </VBtn>
    </template>
  </DialogForm>
  <VBtn 
    variant="tonal" size="small"
    class="mt-3 ms-3"
    @click="$refs['page' + currentPage][0].setEntity()"
  >
    <VIcon icon="tabler-plus" size="18" class="me-2"/>
    {{ $gettext('Add Component') }}
  </VBtn>
</div>
<VWindow v-model="currentPage">
  <VWindowItem
    v-for="item in pages"
    :key="`window${item.id}`"
    :value="item.id"
    transition="fade-transition" 
    reverse-transition="fade-transition"
  >
    <PageView :page="item" :ref="'page' + item.id"/>
  </VWindowItem>
</VWindow>
</template>
