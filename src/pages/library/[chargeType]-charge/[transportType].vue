<script setup>
import { enums as CHARGE_TYPE, slugToChargeType } from '@/config/enums/ChargeType';
import { slugToTransportType, getList as transportTypeList } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/library/Charge';
import EntityService from '@/services/library/ChargeService';
import { useAppStore } from '@/stores/appStore';
import ChargeForm from '@/views/library/ChargeForm.vue';
import { useLibraryHeader } from '@/composables/useLibraryHeader';
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(route, appStore)
const currentChargeType = reactive(slugToChargeType(route.params.chargeType))
const currentTransportType = reactive(slugToTransportType(route.params.transportType))
definePage({ 
  meta: { action: ['MANAGE_Local', 'MANAGE_Service', 'MANAGE_Customs', 'MANAGE_Freight'], subject: 'Charge' },
})
const table = ref(null)
const form = ref(null)
const buttons = computed(() => [{ text: $gettext('Add') + ' ' + currentChargeType.singularTitle, func: form.value?.setEntity }])
const { buttons: headerButtons } = useLibraryHeader()
watch(buttons, val => { headerButtons.value = val }, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })
const apiCallParam = computed(() => {
  return {
    'filter_transportType': currentTransportType.value,
    'filter_chargeType': currentChargeType.value
  }
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
watch(() => route, () => {
  if(!route.params.transportType || !route.params.chargeType) return
  const { value, slug } = slugToTransportType(route.params.transportType)
  currentTransportType.value = value
  currentTransportType.slug = slug
  const { value: value1, title, slug: slug1, icon, singularTitle, transportTypes } = slugToChargeType(route.params.chargeType)
  currentChargeType.value = value1
  currentChargeType.singularTitle = singularTitle
  currentChargeType.slug = slug1
  currentChargeType.title = title
  currentChargeType.icon = icon
  currentChargeType.transportTypes = transportTypes
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
      <BtnSelectGroup  class="mt-4 mb-2"
        :modelValue="route.params.transportType"
        :valueKey="'slug'" variant="outlined"
        @update:modelValue="$router.push({ 
          name: 'library-charge-type-charge-transport-type', 
          params: {
            chargeType: currentChargeType.slug , 
            transportType: $event
          } 
        })"
        :items="transportTypeList.filter(tt => currentChargeType.transportTypes.includes(tt.value))" 
      />
      <VSpacer />
      <VBtn 
        variant="outlined"
        class="mt-4"
        v-if="currentChargeType.value === CHARGE_TYPE.CUSTOM"
        :to="{
          name: 'library-charge-type-charge-type', 
          params: { chargeType: currentChargeType.slug}
        }">
        <VIcon icon="tabler-list" size="24" class="me-2"/>
        {{ $gettext('Types') }}
      </VBtn>
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
  <ChargeForm 
    ref="form" 
    :currentTransportType="currentTransportType"
    :currentChargeType="currentChargeType"
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
