<script setup>
import { getPackageTypeTabs, slugToValue } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/library/PackageType';
import EntityService from '@/services/library/PackageTypeService';
import { useAppStore } from '@/stores/appStore';
import PackageTypeForm from '@/views/library/PackageTypeForm.vue';
import { useLibraryHeader } from '@/composables/useLibraryHeader';
definePage({ 
  meta: { action: 'GET', subject: 'PackageType' },
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const currentTransportType = ref(slugToValue(route.params.transportType))
const buttons = computed(() => [{ text: $gettext('Add Package Type'), func: form.value?.setEntity }])
const { buttons: headerButtons } = useLibraryHeader()
watch(buttons, val => { headerButtons.value = val }, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })
const apiCallParam = computed(() => {
  return {'filter_transportType': currentTransportType.value}
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
watch(() => route, () => {
  if(route.name !== 'library-package-type-transport-type') return
  currentTransportType.value = slugToValue(route.params.transportType)
  nextTick(() => {
    table.value?.fetchData()
  })
}, {
  deep: true
})
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :apiCallParam="apiCallParam"
    :hideTitle="true"
  >
    <template v-slot:beforeTable>

      <VTabs :modelValue="route.params.transportType" class="my-4">
        <v-tab
          v-for="tab in getPackageTypeTabs()"
          :value="tab.slug"
          @click="$router.push({ name: 'library-package-type-transport-type', params: {transportType: tab.slug} })">
          <VIcon :icon="tab.icon" size="12" class="me-2"></VIcon>{{ tab.title }}
        </v-tab>
      </VTabs>
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
  <PackageTypeForm 
    ref="form" 
    :currentTransportType="currentTransportType"
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
