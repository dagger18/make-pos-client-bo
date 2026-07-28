<script setup>
import { useAuthStore } from '@/stores/authStore';
const props = defineProps({
  modelValue: {type: Array, default: () => []},
  filterConfigs: { type: Array, default: () => [] }
})
const user = useAuthStore().user
const route = useRoute()
const tableConfigFilters = (user.tableConfig?.[route.fullPath]?.filters ?? '').split(',').filter(f => f).map(f => {
  const [property, operator, value] = f.split('|||')
  return { property, operator, value: decodeURIComponent(value) }
})
const currentFilters = ref(tableConfigFilters)
const [menu, toggleMenu] = useToggle()
const [someDeleted, toggleSomeDeleted] = useToggle()

const emit = defineEmits(['filterSaved', 'tableConfigFilterApplied', 'filterOpening'])
function filterSaved () {
  toggleSomeDeleted(false)
  toggleMenu(false)
  // todo: filter not nullable filter here
  useAuthStore().saveTableConfig('filters', formatFiltersForTableConfig(), route)
  emit('filterSaved', JSON.parse(JSON.stringify(currentFilters.value)))
}
function filterReset () {
  toggleSomeDeleted(false)
  toggleMenu(false)
  currentFilters.value = []
  useAuthStore().saveTableConfig('filters', formatFiltersForTableConfig(), route)
  emit('filterSaved', [])
}
function filterClose () {
  toggleMenu(false)
  if(someDeleted.value) {
    filterSaved()
  }
}
function triggerTableConfigFilter() {
  console.log('triggerTableConfigFilter', props.modelValue)
  if(Array.isArray(props.modelValue) && props.modelValue.length > 0) {
      reloader.value += 1
      currentFilters.value = props.modelValue
      console.log('reloader', reloader.value)
  }
}
defineExpose({
  triggerTableConfigFilter
})
function formatFiltersForTableConfig() {
  return currentFilters.value.map(f => {
    let filter = JSON.parse(JSON.stringify(f))
    if(filter.property === 'anywhere' 
      && filter.operator === 'eq'
      && !filter.value
      ) return null
    const config = props.filterConfigs.find(f => f.value === filter.property)
    if(!config) {
      if(filter.property !== 'anywhere' || !filter.value) {
        return null
      } 
      filter.property = props.filterConfigs
                        .filter(f => f.type === 'text')
                        .map(f => f.value)
                        .join(',')
    }
    return [filter.property, filter.operator, encodeURIComponent((''+filter.value).trim())].join('|||')
  }).filter(f => f)
}

watch(menu, (opened) => {
  if (opened) emit('filterOpening')
})
const reloader = ref(0)
watch(
  props.modelValue, 
  (newValue, oldValue) => {
    console.log('newValue', newValue, Array.isArray(newValue) && newValue.length > 0)
    console.log('oldValue', oldValue, typeof oldValue === 'undefined')
    if(typeof oldValue === 'undefined' && Array.isArray(newValue) && newValue.length > 0) {
      reloader.value += 1
      currentFilters.value = props.modelValue
      console.log('reloader', reloader.value)
    }
  },
  { deep: true , immediate: true}
)
const filtersLength = computed(() => {
  console.log(currentFilters.value
  .filter(f => f.property !== 'anywhere' || f.operator !== 'eq' || f.value).length)
  return currentFilters.value
    .filter(f => f.property !== 'anywhere' || f.operator !== 'eq' || f.value)
    .length
})
</script>
<template>
<VMenu
  v-model="menu" location="bottom" persistent scrim
  :close-on-content-click="false" eager
>
  <template #activator="slot">
    <VBtn 
      v-bind="slot.props" variant="tonal" 
      :color="filtersLength > 0 ? 'warning' : 'primary'"
      size="small"
      :key="reloader"
    >
      <VIcon 
        icon="tabler-filter-search" 
        size="21" class="me-2 ms-n2"
      />
      {{ $gettext("Filter") }} 
      <template v-if="filtersLength > 0">({{ filtersLength }})</template>
    </VBtn>
  </template>

  <VCard>
    <Filters 
      :filterConfigs="filterConfigs"
      :modelValue="modelValue"
      @update:modelValue="currentFilters = $event"
      @someDeleted="toggleSomeDeleted(true)"
      class="pa-3"
      :key="reloader"
    />

    <VDivider />

    <VCardActions class="pt-4">
      <VBtn 
        prepend-icon="tabler-filter-check" variant="flat" class="px-4" 
        @click="filterSaved"
      >{{ $gettext("Apply") }}</VBtn>
      <VBtn variant="text" @click="filterReset">{{ $gettext("Reset") }}</VBtn>
      <VSpacer />
      <VBtn variant="text" @click="filterClose">{{ $gettext("Close") }}</VBtn>
    </VCardActions>
  </VCard>
</VMenu>
</template>
