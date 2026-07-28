<script setup>
import { enums as ChargeType, findByValue } from '@/config/enums/ChargeType';
import { slugToTransportType, getList as transportTypeList } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/Rate';
// RateService removed - freight-specific service
const EntityService = null;
import RateForm from '@/views/rate/RateForm.vue';
import { useAppStore } from '@/stores/appStore';
const props = defineProps({
  currentChargeType: { type: Object, default: () => {}}
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(route, appStore)
const router = useRouter()
const currentChargeType = reactive(JSON.parse(JSON.stringify(props.currentChargeType)))
const currentTransportType = reactive(slugToTransportType(route.params.transportType))
const table = ref(null)
const form = ref(null)
const buttons = computed(() => {
  return [
    {
      text: $gettext('Add') + ' ' + currentChargeType.shortTitle + ' ' + $gettext('Rate'),
      func: form.value?.setEntity
    }
  ]
})
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
watch(() => route, (newValue, oldValue) => {
  if(newValue.name !== oldValue.name) return
  if(![
    'rate-freight-transport-type',
    'rate-local-transport-type',
    'rate-service-transport-type',
    'rate-customs-transport-type',
  ].includes(newValue.name)) return
  if(!route.params.transportType) return
  const { value: value2, slug: slug2 } = slugToTransportType(route.params.transportType)
  currentTransportType.value = value2
  currentTransportType.slug = slug2
  let newChargeType = null
  if(route.name === 'rate-freight-transport-type') {
    newChargeType = JSON.parse(JSON.stringify(findByValue(ChargeType.Freight)))
  } else if (route.name === 'rate-local-transport-type') {
    newChargeType = JSON.parse(JSON.stringify(findByValue(ChargeType.Local)))
  } else if (route.name === 'rate-service-transport-type') {
    newChargeType = JSON.parse(JSON.stringify(findByValue(ChargeType.Service)))
  } else if (route.name === 'rate-customs-transport-type') {
    newChargeType = JSON.parse(JSON.stringify(findByValue(ChargeType.Customs)))
  } else {
    router.push('/')
    return
  }
  currentChargeType.value = newChargeType.value
  currentChargeType.singularTitle = newChargeType.singularTitle
  currentChargeType.shortTitle = newChargeType.shortTitle
  currentChargeType.slug = newChargeType.slug
  currentChargeType.title = newChargeType.title
  currentChargeType.icon = newChargeType.icon
  currentChargeType.transportTypes = newChargeType.transportTypes
  nextTick(() => {
    if(table.value) {
      table.value.fetchData()
    }
  })
}, {
  deep: true
})
</script>
<template>
  <AppTable
    :headers="headers(currentChargeType)"
    :buttons="buttons"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    sortBy="createdDate"
    :apiCallParam="apiCallParam"
    :pageTitle="currentChargeType.shortTitle + ' ' + $gettext('Rate')"
  >
    <template v-slot:beforeTable>
      <BtnSelectGroup  class="mt-4 mb-2"
        :modelValue="route.params.transportType"
        :valueKey="'slug'" variant="outlined"
        @update:modelValue="$router.push({ 
          name: 'rate-' + currentChargeType.slug + '-transport-type', 
          params: {
            transportType: $event
          } 
        })"
        :items="transportTypeList.filter(tt => currentChargeType.transportTypes.includes(tt.value))" 
      />
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
  <RateForm 
    ref="form" 
    :currentTransportType="currentTransportType"
    :currentChargeType="currentChargeType"
    @entitySubmitted="$refs.table.fetchData()"
  />
</template>
