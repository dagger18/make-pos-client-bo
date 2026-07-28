<script setup>
import useDebouncedRef from '@/composables/useDebouncedRef';
import CommonService from '@/services/CommonService';
import { useFieldTooltipError } from '@/composables/useFieldTooltipError';
import FieldErrorTooltip from '@/components/common/FieldErrorTooltip.vue';
import { v4 as uuidv4 } from 'uuid';
let componentId = uuidv4()
componentId = 'A' + componentId.substring(0, 8)
const props = defineProps({
  apiEndpoint: { },
  searchOnProperties: { type: Array, default: () => ['name'] },
  searchCriterias: { type: Array, default: () => [] },
  callParams: { type: Object, default: () => {} },
  modelValue: { },
  limit: { type: Number, default: 20},
  coreItems: { type: Array, default: () => []  },
  coreItemsGroup: { type: String, default: '' },
  dynamicItemsGroup: { type: String, default: '' },
  acceptTextInput: {type: Boolean, default: false},
  showXOnSelected: {type: Boolean, default: true},
  hint: { type: String, default: '' },
  lazyLoad: { type: Boolean, default: false },
  isSubmenu: {type: Boolean, default: false},
})
const reloader = ref(0)
const search = useDebouncedRef(props.acceptTextInput ? props.modelValue : '', 800)
let state = reactive({
  items: [],
  currentPage: null,
  totalPages: null
})

let emptyState = reactive({
  items: [],
  currentPage: null,
  totalPages: null
})
const [menu, toggleMenu] = useToggle()
const [showTextField, toggleShowTextField] = useToggle()
const [loading, toggleLoading] = useToggle()
const currentState = computed({
  get() {
    const checker = reloader.value
    return search.value ? state : emptyState
  },
  set(value) {
    if(search.value) {
      state = reactive({...value}) 
    } else {
      emptyState = reactive({...value}) 
    }
    reloader.value += 1
  }
})

watch(search, newSearch => {
  if(props.acceptTextInput && newSearch === props.modelValue && newSearch !== '') return
  if(props.hint && newSearch === '') return
  if(newSearch !== '' || emptyState.items.length === 0) {
    fetchData()
  }
})
function buildParams (target, page = null) {
  const params = { 
    page: page ?? ((target.value.currentPage || 0) + 1),
    limit: props.limit
  }
  if (search.value) {
    if(props.searchCriterias.length > 0) {
      props.searchCriterias.forEach((criteria, idx) => {
        if(!criteria.condition || criteria.condition(search.value)) {
          params[`filters[${idx}][0]`] = criteria.property
          params[`filters[${idx}][1]`] = criteria.operator
          params[`filters[${idx}][2]`] = search.value
        }
      })
    } else if(props.searchOnProperties.length > 0) {
      params['filters[0][0]'] = props.searchOnProperties.join(',')
      params['filters[0][1]'] = 'like'
      params['filters[0][2]'] = search.value
    }
  }
  return { ...params, ...props.callParams }
}
async function fetchData() {
  if (search.value) {
    toggleLoading(true)
  }
  reloader.value += 1
  const result = await props.apiEndpoint
                      .listCacheable(
                        CommonService.serialize(
                          buildParams(currentState, 1)
                        )
                      )
  // accept search as value
  if(props.acceptTextInput && result.list.length === 0) {
    toggleLoading(false)
    emit('update:modelValue', search.value)
    //toggleMenu(false)
    currentState.value = {
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      items: result.list
    }
    return
  }
  currentState.value = {
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    items: result.list
  }
  reloader.value += 1
  if (search.value) {
    toggleLoading(false)
  }
  
}
async function endIntersect (isIntersecting) {
  if (isIntersecting && menu.value) {
    reloader.value += 1
    if (currentState.value.currentPage && currentState.value.totalPages 
        && currentState.value.currentPage < currentState.value.totalPages 
        // ???
        && currentState.value.items.length > (props.limit - 1)
    ) {
      const result = await props.apiEndpoint
                          .listCacheable(
                            CommonService.serialize(
                              buildParams(currentState)
                            )
                          )
      if (result.list) {
        currentState.value = {
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          items: toRaw(currentState.value.items).concat(result.list)
        }
        reloader.value += 1
      }
    }
  }
}
onMounted(() => {
  if (!props.hint && !props.lazyLoad) fetchData()
})
const searchInput = ref(null)
const selectInput = ref(null)
const { fieldRef: errorFieldRef, errorMessage } = useFieldTooltipError()
watchEffect(() => { errorFieldRef.value = selectInput.value })

const attrs = useAttrs()
const selectedText = computed(() => {
  if(!props.modelValue) return null
  const attribute = attrs.itemTitle ?? 'name'
  if(typeof props.modelValue === 'string') return props.modelValue
  if (typeof attribute === 'string' || attribute instanceof String)
    return attribute in props.modelValue ? props.modelValue[attribute] : props.modelValue
  else
    return attribute(props.modelValue)
})
function itemTitle(item) {
  if(!item) return null
  const attribute = attrs.itemTitle ?? 'name'
  if (typeof attribute === 'string' || attribute instanceof String)
    return attribute in item ? item[attribute] : item
  else
    return attribute(item)
}
const emit = defineEmits(['update:modelValue'])
function onItemSelected(item) {
  console.log('item selected')
  if(props.acceptTextInput) {
    const attribute = attrs.itemTitle ?? 'name'
    if (typeof attribute === 'string' || attribute instanceof String) {
      emit('update:modelValue', item[attribute])
      search.value = item[attribute]
    }
    else {
      emit('update:modelValue', attribute(item))
      search.value = attribute(item).split(',')[0]
    }
  } else {
    emit('update:modelValue', item)
  }
  toggleShowTextField(false)
  onMenuStateChange(false)
  nextTick(() => selectInput.value?.validate())
}
watch(
  () => props.modelValue,
  () => nextTick(() => selectInput.value?.validate()),
)
watch(
  () => props.callParams,
  (newValue, oldValue) => {
    console.log('nothing here right')
    if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
      return
    }
    const isAllNull = Object.keys(props.callParams).every(key => !props.callParams[key])
    if (isAllNull) {
      if (state.items.length > 0) {
        console.log('i call for do reset here')
        // todo: doReset()
      }
    } else {
      fetchData()
    }
  },
  { deep: true }
)
function onMenuStateChange(state) {
  console.log('onMenuStateChange', state)
  console.log('is text field focused', searchInput.value.focused)
  if(!state && searchInput.value.focused) {
    return
  }
  toggleMenu(state)
  console.log('set menu.value', state)
  if(menu.value) {
    if(props.acceptTextInput) {
      search.value = props.modelValue
    }
    if(props.lazyLoad && emptyState.items.length === 0 && !search.value) {
      fetchData()
    }
    searchInput.value.focus()
  } else {
    if(!props.acceptTextInput) {
      search.value = ''
    }
    toggleShowTextField(false)
  }
}
</script>
<template>
  <div class="search-select-wrapper" 
      :class="[componentId]">
    <VTextField
      :style="{ marginBlockEnd: props.isSubmenu ? '0' : '-40px' }"
      v-model="search"
      ref="searchInput" bg-color="rgb(var(--v-theme-background))"
      :placeholder="$gettext('Enter your search') + '...'"
      v-show="showTextField"
    >
      <template v-slot:append-inner>
        <VProgressCircular v-if="loading" indeterminate size="18" width="2" class="me-2"/>
      </template>
    </VTextField>
    <v-select
      v-show="!showTextField"
      ref="selectInput"
      v-bind="attrs"
      :modelValue="selectedText"
      hide-no-data
      hide-details
      validate-on="blur"
      :menu-icon="errorMessage ? '' : undefined"
      @click="toggleShowTextField(true)"
    >
      <template v-slot:selection>
        <v-chip class="d-flex w-100" label>
          <span class="text-body-2" v-html="selectedText"></span>
          <VSpacer />
          <template v-slot:append v-if="showXOnSelected">
            <VIcon icon="tabler-x" class="me-n1 ms-2" @click.prevent.stop="emit('update:modelValue', null)" size="16"></VIcon>
          </template>
        </v-chip>
      </template>
      <template #append-inner>
        <FieldErrorTooltip :message="errorMessage" />
      </template>
    </v-select>
    <VMenu
      v-if="!attrs.disabled"
      max-height="300px"
      :activator="'.' + componentId"
      @update:modelValue="onMenuStateChange"
      :modelValue="menu"
      :persistent="props.isSubmenu"
    >
      <VList v-if="currentState.items.length > 0 || coreItems.length > 0">
        <VListSubheader v-if="coreItemsGroup" class="good-select-subheader font-weight-bold text-disabled text-primary text-uppercase">
          {{ coreItemsGroup }}
        </VListSubheader>
        <v-list-item class="my-0" density="compact"
          v-for="(item, idx) in coreItems"
          :key="idx"
          :title="itemTitle(item)"
          @click.stop="onItemSelected(item)"
        />
        <VDivider v-if="coreItems.length > 0" class="mt-2 pb-2" />
        <VListSubheader v-if="dynamicItemsGroup" class="good-select-subheader font-weight-bold text-disabled text-primary text-uppercase">
          {{ dynamicItemsGroup }}
        </VListSubheader>
        <v-list-item class="my-0" density="compact"
          v-for="(item, idx) in currentState.items"
          :key="idx"
          @click.stop="onItemSelected(item)"
          v-html="itemTitle(item)"
        >
        </v-list-item>
        <div
          v-intersect="{
            handler: endIntersect,
            options: {
              threshold: [0.5]
            }
          }"
          class="search-select-loader py-3 px-2 mt-2 text-center"
          v-show="currentState.currentPage < currentState.totalPages"
        >
          <v-progress-circular
            indeterminate
            :size="20" :width="2"
          ></v-progress-circular>&nbsp;&nbsp;
          <span class="grey--text text-italic">
            {{ $gettext('Searching database. Please wait') }} ...
          </span>
        </div>
      </VList>
      <VCard v-else class="pa-4">
        <span v-if="loading || (lazyLoad && !search)">
          {{ $gettext('Searching database. Please wait') }} ...
        </span>
        <span v-else-if="hint && !search" class="text-italic text-disabled">
          {{ hint }}
        </span>
        <span v-else-if="acceptTextInput" class="text-italic text-error">
          {{ $gettext('No data available. Current search text will be accepted as new value') }}
        </span>
        <span v-else class="text-italic text-error">
          {{ $gettext('No data available. Please input search text again') }}
        </span>
      </VCard>
    </VMenu>
  </div>
</template>
<style lang="scss">
.search-select-wrapper {
  position: relative;

  .v-select__selection {
    flex-grow: 1;

    .v-chip__content {
      flex-grow: 1;
    }
  }
}

.v-list--density-comfortable .v-list-subheader.good-select-subheader {
  padding-inline-start:  16px !important;
}

.search-select-loader {
  background: #F7F9FE;
  margin-block-end: -8px;

  .grey--text.font-italic {
    position: relative;
    display: inline-block;
    transform: translateY(2px);
  }
}
</style>
