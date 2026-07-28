<script setup>
import { operatorList } from '@/services/CommonService';
import { v4 as uuidv4 } from 'uuid';
import { VAutocomplete, VSelect, VTextField } from 'vuetify/lib/components/index.mjs';
import DatePicker from '../form/DatePicker.vue';
import GoodSearchSelect from '../form/GoodSearchSelect.vue';
import ClientService from '@/services/ClientService';
import UserService from '@/services/UserService';
import BranchService from '@/services/BranchService';
import DepartmentService from '@/services/DepartmentService';
const serviceMap = {
  'ClientService': ClientService,
  'UserService': UserService,
  'BranchService': BranchService,
  'DepartmentService': DepartmentService,
}
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  filterConfigs: { type: Array, default: () => [] }
})
const dummyFilter = {
  property: 'anywhere',
  operator: 'eq',
  value: null
}
const state = reactive({
  filters: JSON.parse(JSON.stringify(props.modelValue)),
  valueComponents: {}
})

const properties = computed(() => {
  return [
    {
      'title': $gettext('Anywhere'),
      'value': 'anywhere'
    },
    ...props.filterConfigs
  ]
})
function addFilter() {
  const key = uuidv4()
  state.filters.push({...dummyFilter, key})
  state.valueComponents[key] = markRaw(VTextField)
  //console.log('empty filter added', JSON.parse(JSON.stringify(state.filters)))
}
function getOperatorList(property) {
  const config = props.filterConfigs
                  .find(filterConfig => filterConfig.value === property)
  if(!config) return []
  let filterType = property === 'anywhere' ? 'anywhere' : config.type
  if(config && config.isMemberOfOnly) {
    return operatorList()
      .filter(({groups}) => groups && groups.includes('isMemberOf'))
  }
  return operatorList()
    .filter(({groups}) => groups && (groups.includes(filterType) || groups.includes('*')))
}
function setValueComponent(filter, newOperator = null) {
  if(newOperator) {
    filter.operator = newOperator
  }
  const configReactive = filter.property === 'anywhere' 
                          ? { type: 'text'}
                          : props.filterConfigs
                            .find(filterConfig => filterConfig.value === filter.property)
  if(!configReactive) return null
  const config = JSON.parse(JSON.stringify(configReactive))
  let newComponent = null
  switch (config.type) {
    case 'text': newComponent = VTextField; break;
    case 'select': newComponent = VSelect; break;
    case 'date': newComponent = DatePicker ; break;
    default: newComponent = VTextField;
  }
  console.log('new operator', filter.operator)
  if(config.type === 'date' && filter.operator === 'relativeRange') {
    newComponent = VSelect
  }
  if(config.type === 'select' && config.hasOwnProperty('isAutocompleteSelect')) {
    newComponent = VAutocomplete
  }
  if(config.type === 'select' && config.hasOwnProperty('apiEndpoint')) {
    newComponent = GoodSearchSelect
  }
  if(!filter.key || !state.valueComponents[filter.key]) {
    filter.key = uuidv4()
    state.valueComponents[filter.key] = markRaw(newComponent)
  } else if(newComponent.name !== state.valueComponents[filter.key].name) {
    state.valueComponents[filter.key] = markRaw(newComponent)
    filter.value = null
  }
  // empty chosen operator if not in operator list
  const isInList = getOperatorList(filter.property).some(op => op.value === (filter.operator ?? 'eq'))
  if(!isInList) {
    filter.operator = 'eq'
  }
}
function valueComponentConfig(property, operator) {
  const configReactive = property === 'anywhere' 
                          ? { type: 'text-field'}
                          : props.filterConfigs
                            .find(filterConfig => filterConfig.value === property)
  if(!configReactive) return null
  const config = JSON.parse(JSON.stringify(configReactive))
  const operatorConfig = operatorList().find(oC => oC.value === (operator ?? 'eq'))
  const disabled = operatorConfig.valueComponentDisabled
  const multiple = !!operatorConfig.multiple
  if(config.type === 'select') {
    config.valueComparator = (value, item) => {
      const itemId = item.id ?? item.value ?? item
      const valueId = value.id ?? value.value ?? value
      if(valueId == itemId) return true
      return false
    }
  }
  if(config.type === 'date') {
    // :))
    console.log('yes im date config')
    if(operatorConfig.hasOwnProperty('dateConfig')) {
      config.config = {...operatorConfig.dateConfig, ...config.config}
    }
    config.toUTCDateOnPick = false
    config.toDateOnMounted = false
    if(operator === 'relativeRange') {
      config.items = operatorConfig.ranges
    }
  }
  if(config.apiEndpoint) {
    config.apiEndpoint = serviceMap[config.apiEndpoint]
    config.isSubmenu = true
    delete config.items
  }
  delete(config.type)
  delete(config.title)
  delete(config.value)
  return {multiple, disabled, ...config}
}
let debouncer = null

const emit = defineEmits(['update:modelValue', 'someDeleted'])
watch(() => state.filters, (newValue) => {
  //console.log(JSON.parse(JSON.stringify(state.filters)), 'state.filters reactive')
  const lastFilter = newValue[newValue.length - 1]
  if(lastFilter 
    && lastFilter.property === 'anywhere'
    && lastFilter.operator === 'eq'
    && lastFilter.value === null
  ) {
    let setValued = false
    state.filters.forEach(filter => {
      if(!filter.key || !state.valueComponents[filter.key]) {
        setValueComponent(filter)
        setValued = true
      }
    })
    // not push update, wait for next loop since we have component setted
    if(setValued) return

    if(debouncer) {
      clearTimeout(debouncer)
    }
    debouncer = setTimeout(() => {
      console.log('PUSH DATA FILTER here', JSON.parse(JSON.stringify(state.filters)))
      emit('update:modelValue', state.filters)
    }, 800)
    return
  }
  addFilter()
}, {
  deep: true,
  immediate: true
})
watch(() => props.modelValue, (newValue) => {
  if(newValue.length === 0) {
    state.filters = []
  }
})
</script>
<template>
<table class="w-100">
  <tr v-for="(filter, index) in state.filters" :key="index">
    <td class="pb-1">
      <VSelect 
        style="min-inline-size:110px" 
        :items="properties" 
        v-model="filter.property"
        @update:modelValue="setValueComponent(filter)"
      ></VSelect> 
    </td>
    <td class="pb-1">
      <VSelect 
        style="min-inline-size:40px" 
        :items="getOperatorList(filter.property)" 
        :modelValue="filter.operator"
        @update:modelValue="setValueComponent(filter, $event)"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item 
            v-bind="props" 
            :title="item.raw.title + (item.raw.symbol ? ' ( ' + item.raw.symbol + ' )' : '')"
          >
          </v-list-item>
        </template>
        <template v-slot:selection="{ item, index }">
          {{ item.raw.symbol ?? item.raw.title }}
        </template>
      </VSelect>
    </td>
    <td class="pb-1">
    <KeepAlive>
      <Component 
        style="min-inline-size:150px"
        :key="filter.property + filter.operator + index"
        v-model="filter.value"
        :is="state.valueComponents[filter.key]"
        v-if="valueComponentConfig(filter.property, filter.operator)"
        v-bind="valueComponentConfig(filter.property, filter.operator)" />
    </KeepAlive>
    </td>
    <td class="pb-1">
      <VIcon 
        color="error"
        v-if="index !== state.filters.length - 1" 
        icon="tabler-trash" 
        @click="state.filters.splice(index, 1) ; emit('someDeleted')"></VIcon>
    </td>
  </tr>
  
</table>
</template>
