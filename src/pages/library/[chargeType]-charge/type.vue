<script setup>
import { slugToChargeType } from '@/config/enums/ChargeType';
import { getList as transportTypeList } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/library/CustomChargeType';
import EntityService from '@/services/library/CustomChargeTypeService';
import { useAppStore } from '@/stores/appStore';
import CustomChargeTypeForm from '@/views/library/CustomChargeTypeForm.vue';
import { useLibraryHeader } from '@/composables/useLibraryHeader';
definePage({
  meta: { action: ['MANAGE_Local', 'MANAGE_Service', 'MANAGE_Customs', 'MANAGE_Freight'], subject: 'Charge', navActiveLink: 'library-charge-type-charge-transport-type' },
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const currentChargeType = reactive(slugToChargeType(route.params.chargeType))
const table = ref(null)
const form = ref(null)
const buttons = computed(() => [{ text: $gettext('Add Custom Charge Type'), func: form.value?.setEntity }])
const { buttons: headerButtons } = useLibraryHeader()
watch(buttons, val => { headerButtons.value = val }, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :hideTitle="true"
  >
    <template v-slot:beforeTable>
      <BtnSelectGroup  class="mt-4"
        :valueKey="'slug'" variant="outlined"
        @update:modelValue="$router.push({ 
          name: 'library-charge-type-charge-transport-type', 
          params: {
            chargeType: currentChargeType.slug , 
            transportType: $event
          } 
        })"
        :items="transportTypeList.filter(tt => currentChargeType.transportTypes.includes(tt.value))" />
      <VSpacer />
      <VBtn class="mt-4"><VIcon icon="tabler-list" size="24" class="me-2"/>{{ $gettext('Types') }}</VBtn>
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
  <CustomChargeTypeForm 
    ref="form" 
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
