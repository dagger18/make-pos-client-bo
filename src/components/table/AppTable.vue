<script setup>
import useDebouncedRef from '@/composables/useDebouncedRef';
import CommonService, { djb2Hash } from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { nextTick, watch } from 'vue';
import { useGettext } from "vue3-gettext";
const props = defineProps({
  filterConfigs: { type: Function, default: () => [] },
  headers: { type: Array, default: () => [] },
  buttons: { type: Array, default: () => [] },
  itemKey: { type: String, default: 'id' },
  pageTitle: { type: String, default: '' },
  hideTitle: { type: Boolean, default: false },
  sortBy: { type: String, default: 'id' },
  sortDesc: { type: Boolean, default: true },
  rowsPerPage: { type: Number, default: 50 },
  showPaging: { type: Boolean, default: true },
  stickyHeader: { type: Boolean, default: true },
  apiService: { },
  apiCallParam: { type: Object, default: () => {} },
  isReportTable: { type: Boolean, default: false },
  totalRow: { type: Array, default: () => [] },
  isReportTableInDatasetForm: { type: Boolean, default: false },
  showPureArray: { type: Boolean, default: false },
  filterValues: { type: Array, default: () => []},
  reportName: { type: String, default: null },
  noResultText: { type: String, default: null },
  selectable: { type: Array, default: () => [] },
})

const user = useAuthStore().user

const route = useRoute()
console.log('route in table', { route })
const [tableConfigSortField, tableConfigSortDirection] = (user.tableConfig?.[route.fullPath]?.sort ?? '').split(',')
const pagination = reactive({
  descending: typeof tableConfigSortDirection !== 'undefined' ? (tableConfigSortDirection === 'desc') : props.sortDesc,
  sortBy: (tableConfigSortField !== '' ? tableConfigSortField : null) ?? props.sortBy,
  rowsPerPageItems: [20, 50, 100, 200],
  rowsPerPage: props.rowsPerPage,
  page: 1
})

const tableConfigFilters = (user.tableConfig?.[route.fullPath]?.filters ?? '').split(',').filter(f => f).map(f => {
  const [property, operator, value] = f.split('|||')
  return { property, operator, value: decodeURIComponent(value) }
})

const state = reactive({
  savedFilters: [],
  items: [],
  headerPositions: (user.tableConfig?.[route.fullPath]?.columns?.split(',') ?? [])
})
const totalRow = ref([])
const totalPages = ref(0)
const totalItems = ref(0)
const loading = ref(false)
const verticalScroll = ref(null)
const minHeight = ref(null)
const table = ref(null)
const dummyHeader = ref(null)
const realHeader = ref(null)
const loadingText = ref(null)
const { $gettext } = useGettext();
const quickSearch = useDebouncedRef('', 1100)
let loadingTimeout = null
const slots = useSlots()
const tableFilterRef = ref(null)
const filterConfigsResolved = ref(false)
const resolvedFilterConfigs = computed(() => {
  if (!filterConfigsResolved.value) return []
  return props.filterConfigs()
})
function resolveFilterConfigs() {
  filterConfigsResolved.value = true
}
const hasSlot = (name) => {
  return !!slots[name];
}
const changeSort = (field) => {
  pagination.descending = !pagination.descending
  pagination.sortBy = field
  fetchData()
  if(!props.isReportTable) {
    useAuthStore().saveTableConfig('sort', [field, pagination.descending ? 'desc' : 'asc'], route)
  }
}

const fetchData = async (paging = false) => {
  if(!props.apiService || !props.apiService.list) return
  const params = buildParams(paging)
  loading.value = true
  nextTick(() => {
    const tableWrapper = table.value?.$el.querySelector('.v-table__wrapper')
    loadingText.value.style.width = tableWrapper.offsetWidth + 'px'
  })
  
  loadingTimeout = setTimeout(() => {
    loading.value = false
  }, 20000)
  nextTick(() => {
    checkTableMinHeight()
  })
  const response = await props.apiService.list(CommonService.serialize(params))
  loading.value = false
  clearTimeout(loadingTimeout)
  if(props.showPureArray) {
    state.items = response.data
    totalItems.value = state.items.length
    totalRow.value = response.total
  } else {
    state.items = response.list
    totalPages.value = response.totalPages
    totalItems.value = response.total
    pagination.page = response.currentPage
  }
  
  nextTick(() => {
    checkVerticalScroll(false)
  }, 200)
}
const buildParams = (paging = false, extraParam = {}) => {
  let params = {
    limit: pagination.rowsPerPage,
    page: paging ? pagination.page : 1
  }
  if (props.apiCallParam) {
    params = Object.assign(JSON.parse(JSON.stringify(props.apiCallParam)), params)
  }
  const direction = pagination.descending ? 'desc' : 'asc'
  delete(params['sort_asc'])
  delete(params['sort_desc'])
  params['sort_' + direction] = pagination.sortBy

  state.savedFilters
    .forEach((f, index) => {
      let filter = JSON.parse(JSON.stringify(f))
      if(filter.property === 'anywhere' 
        && filter.operator === 'eq'
        && !filter.value
        ) return
      const config = resolvedFilterConfigs.value.find(f => f.value === filter.property)
      if(!config) {
        if(filter.property !== 'anywhere' || !filter.value) {
          return
        }
        filter.property = resolvedFilterConfigs.value
                          .filter(f => f.type === 'text')
                          .map(f => f.value)
                          .join(',')
      }
      if(config && config.preSubmitCallback) {
        filter = config.preSubmitCallback(filter)
      }
      // todo: edge case like multiple
      params[`filters[${index}][0]`] = filter.property
      params[`filters[${index}][1]`] = filter.operator
      const filterValue = filter.value !== null && typeof filter.value === 'object' ? (filter.value.id ?? filter.value) : filter.value
      params[`filters[${index}][2]`] = encodeURIComponent((''+filterValue).trim())
    })
  if(quickSearch.value) {
    const index = state.savedFilters.length
    params[`filters[${index}][0]`] = resolvedFilterConfigs.value
                                      .filter(f => f.type === 'text')
                                      .map(f => f.value)
                                      .join(',')
    params[`filters[${index}][1]`] = 'like'
    params[`filters[${index}][2]`] = encodeURIComponent((''+quickSearch.value).trim())
  }
  if(props.isReportTable 
    || (extraParam.exportFileName 
        && (
          extraParam.exportFileName === 'ClientData'
          || extraParam.exportFileName === 'ProviderData'
        )
      )
  ) {
    props.headers.forEach((header, index) => {
      if(header.noReport) return
      if(index === 0 && props.showPureArray) return
      params[`columns[${index}]`] = encodeURIComponent(header.reportKey ?? header.key)
      params[`title[${index}]`] = encodeURIComponent(header.text)
    })
    params['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return {...params, ...extraParam}
}
function buildParamsForExport() {
  let params = {}
  let registeredParamIndex = 0
  props.headers.forEach((header, index) => {
    if(index === 0 && props.showPureArray) return
    if(header.noReport) return
    params[`columns[${registeredParamIndex}]`] = encodeURIComponent(header.reportKey ?? header.key)
    params[`title[${registeredParamIndex}]`] = encodeURIComponent(header.text)
    registeredParamIndex++
  })
  params['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  params[`filters[0][0]`] = 'id'
  params[`filters[0][1]`] = 'inArray'
  params[`filters[0][2]`] = state.items.filter(item => item.selected).map(item => item.id).join(',')
  return params
}

watch(quickSearch, newSearch => {
  console.log('newSearch', { newSearch })
  fetchData()
})

const removeItem = (item) => {
  const index = state.items.findIndex(i => i.id === item.id)
  if (index === -1) return
  state.items.splice(index, 1)
  totalItems.value --
  totalPages.value = Math.ceil(totalItems.value / pagination.rowsPerPage)
  if (pagination.page > totalPages.value) {
    pagination.page = totalPages.value
    fetchData()
  }
}
const handleDelete = async (entity, buttonComponent) => {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to delete this entity? This might result in data loss. You should delete all dependencies of this entity first.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    buttonComponent.disabled = false
    return
  }
  buttonComponent.addToQueuingList()
  const result = await props.apiService.delete(entity.id)
  if (result) {
    removeItem(entity)
  }
}
let checkVerticalScrollTimeout = null
const checkTableMinHeight = () => {
  const tableWrapper = table.value?.$el.querySelector('.v-table__wrapper')
  if(!tableWrapper) return
  const margin = props.isReportTable ? 249 : 19
  if(props.isReportTable) {
    tableWrapper.style.minHeight =  '420px'
    tableWrapper.style.maxHeight = '420px'
    tableWrapper.style.height = '420px'
  } else if(props.isReportTableInDatasetForm ) {
    tableWrapper.style.minHeight = (window.innerHeight - margin) + 'px'
    tableWrapper.style.maxHeight = (window.innerHeight - margin) + 'px'
    tableWrapper.style.height = (window.innerHeight - margin) + 'px'
  } else if ((tableWrapper.scrollHeight + tableWrapper.getBoundingClientRect().top) < window.innerHeight) {
    tableWrapper.style.minHeight = ((window.innerHeight - margin) - tableWrapper.getBoundingClientRect().top) + 'px'
  } else  {
    tableWrapper.style.minHeight = 'unset'
  }
}
const checkVerticalScroll = (shouldCheckTableMinHeight = true) => {
  clearTimeout(checkVerticalScrollTimeout)
  checkVerticalScrollTimeout = setTimeout(() => {
    if(!table.value) {
      return
    }
    const tableWrapper = table.value.$el.querySelector('.v-table__wrapper')
    if (tableWrapper.scrollWidth > tableWrapper.clientWidth && state.items.length > 0) {
      verticalScroll.value = tableWrapper.scrollWidth
    } else {
      verticalScroll.value = null
    }
    if(shouldCheckTableMinHeight) {
      checkTableMinHeight()
    }
    // for some reason, body overflow-y is hidden, so we remove it
    if(!props.isReportTable) {
      document.querySelector('html').classList.remove('overflow-y-hidden');
    }
  }, 200)
  
}
const onVerticalScroll = (event) => {
  table.value.$el.querySelector('.v-table__wrapper').scrollLeft = event.target.scrollLeft
}
const checkHeaderY = () => {
  if(props.isReportTable) return
  const viewPortY = dummyHeader.value.getBoundingClientRect().top
  if(viewPortY >= 0) {
    realHeader.value.targetDomElement.style.transform = 'translateY(-48px)'
    return
  }
  realHeader.value.targetDomElement.style.transform = 'translateY(' + (Math.abs(viewPortY) - 48) + 'px)'
}

window.addEventListener('resize', checkVerticalScroll)
window.addEventListener('scroll', checkHeaderY)

onUnmounted(() => {
  window.removeEventListener('resize', checkVerticalScroll)
  window.removeEventListener('scroll', checkHeaderY)
})
onMounted(async () => {
  checkTableMinHeight()
  state.savedFilters = props.filterValues.concat(tableConfigFilters)
  nextTick(() => {
    if(tableFilterRef.value) {
      tableFilterRef.value.triggerTableConfigFilter()
    }
  })
  await fetchData()
})
watch(() => props.filterValues, (newValue) => {
  state.savedFilters = props.filterValues.concat(tableConfigFilters)
})
function renderItemProperty(item, key) {
  return key.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : null
  }, item || self)
}
function renderNormalItem(header, item, key) {
  if(props.showPureArray) return item[key]
  if(header.renderObject) return header.renderObject(item)
  return renderItemProperty(item, header.key)
}
defineExpose({
  fetchData,
  handleDelete,
  apiService: props.apiService,
  buildParams,
  headers: props.headers,
  state: state,
  totalRow,
  buildParamsForExport
})

function copyText(string) {
  const stripedText = string.replace(/(<([^>]+)>)/ig, '')
  navigator.clipboard.writeText(stripedText);
  useAppStore().pushErrorMessage({
    success: true,
    detail: $gettext('Copied to clipboard')
  })
}
const computedHeaders = computed(() => {
  const sortedHeaders = props.headers.sort((a, b) => {
    if(a.renderSlot === 'action') return 1
    const aPosition = state.headerPositions.findIndex(pos => pos == djb2Hash(a.key + a.text))
    const bPosition = state.headerPositions.findIndex(pos => pos == djb2Hash(b.key + b.text))
    if(aPosition !== -1 && bPosition !== -1) return aPosition - bPosition
    if(aPosition !== -1 && bPosition === -1) return -1
    if(aPosition === -1 && bPosition !== -1) return 1
    return 0
  })
  return (props.selectable.length > 0 
          ? [
              {
                renderSelectRow: true, 
                headerClass: 'ps-0 selectCell', 
                bodyClass: 'ps-0 selectCell'
              }
            ] 
          : []
    ).concat(sortedHeaders)
})
const selectAllState = computed(() => {
  return state.items.length > 0 && state.items.some(i => i.selected)
})
function toggleSelectAllState() {
  const currentState = !selectAllState.value
  state.items.forEach(i => i.selected = currentState)
}
async function onPosition(items) {
  const filteredItem = items.filter(item => !item.renderSelectRow && item.renderSlot !== 'action')
  const headerPositions = []
  filteredItem.forEach(item => {
    headerPositions.push(djb2Hash(item.key + item.text))
  })
  state.headerPositions = headerPositions
  useAuthStore().saveTableConfig('columns', headerPositions, route)
}
const [dragging, toggleDragging] = useToggle()
function applyFilter(filters) {
  state.savedFilters = filters
  fetchData()
 
}
</script>
<template>
  <div 
    class="table-wrapper"
    style="margin-block-end: -1rem;" 
    ref="tableWrapperRef"
  >
    <AppTableTitle 
      :buttons="buttons" :total="totalItems" 
      v-if="!hideTitle && !isReportTable"
      :toggleVerticalOverlayNavActive="$parent.$attrs.toggleVerticalOverlayNavActive"
    >
      <slot name="title"></slot>
      <span v-if="!hasSlot('title')" class="primary--text text-h5">{{ pageTitle }}</span>
    </AppTableTitle>
    <div class="d-flex">
      <slot name="beforeTable" />
    </div>
    <VCard class="mt-2">
      <VCardText class="pa-3" v-if="!isReportTable">
        <VRow class="flex-nowrap">
          <VCol cols="auto" class="d-flex align-center">
            <AppTableFilter
              :filterConfigs="resolvedFilterConfigs"
              :modelValue="state.savedFilters"
              @filterSaved="applyFilter($event)"
              @filterOpening="resolveFilterConfigs"
              ref="tableFilterRef"
            />
          </VCol>
          <VCol cols="auto" class="ms-n3 d-flex align-center">
            <AppTextField
              style="min-inline-size: 200px;"
              density="compact"
              class="tiny"
              prepend-inner-icon="tabler-search"
              :placeholder="$gettext('Quick Seach')"
              v-model="quickSearch" clearable
              v-if="!isReportTable"
            />
          </VCol>
          <VSpacer></VSpacer>
          
          <VCol cols="auto" >
            <slot name="tableAction" />
            <VBtn 
              variant="text" color="secondary" size="x-small" 
              style="inline-size: 20px; min-inline-size: unset;" @click="fetchData" class="mt-1"
            >
              <VIcon icon="tabler-refresh" size="20" />
            </VBtn>
            <VBtn variant="tonal" color="gray" size="small" v-if="false">
              <VIcon 
              icon="tabler-file-download" 
              size="26" class="me-2 ms-n2"
            />
              {{ $gettext("Export") }}</VBtn>
          </VCol>
        </VRow>
      </VCardText>
      
      <VDivider />
      <VDataTable
        :headers="computedHeaders"
        :items="state.items"
        disable-pagination
        :item-key="itemKey"
        hide-default-footer
        hide-default-header
        :loading="loading"
        :hover="true"
        ref="table"
        :itemsPerPage="-1"
        :class="{
          'has-verticalScroll': verticalScroll && verticalScroll.value,
          'lastColumnSticky': !isReportTable,
          'isReportTable': isReportTable
        }"
        :fixed-header="isReportTable"
      >
        <template v-slot:headers>
          <tr 
            class="dummy-header" style="opacity: 0;" ref="dummyHeader" 
            v-if="!isReportTable"
          >
            <th 
              v-for="(header, index) in computedHeaders"
              :key="index"  
              :class="[header.headerClass]"
            >
              <span v-html="header.text">
              </span>
            </th>
          </tr>
          <Draggable
            class="list-group real-header" ref="realHeader"
            tag="tr"
            :component-data="{
              type: 'transition-group',
              name: !dragging ? 'flip-list' : null
            }"
            :modelValue="computedHeaders"
            @update:modelValue="onPosition($event)"
            v-bind="{
                animation: 200,
                group: 'description',
                disabled: false,
                ghostClass: 'ghost'
              }"
            @start="toggleDragging(true)"
            @end="toggleDragging(false)"
            :itemKey="(item) => item.key + item.text"
          >
            <template #item="{ element: header , index }">
              <th
                :class="[
                  'sortable column', header.headerClass
                ]"
              >
              <v-hover
                :key="index"
                v-slot="{ isHovering, props }">
                <div v-if="header.renderSelectRow">
                  <v-checkbox-btn
                    :modelValue="selectAllState"
                    @click="toggleSelectAllState()"
                  ></v-checkbox-btn>
                  <div v-if="selectAllState" class="selectActions">
                    <v-btn 
                      v-for="selectBtn in selectable"
                      @click="selectBtn.action"
                      variant="tonal" :color="selectBtn.color ?? 'primary'" size="small"
                    >
                      <v-icon 
                        :icon="selectBtn.icon" size="21" class="me-2 ms-n2"/> {{ selectBtn.text }}</v-btn>
                  </div>
                </div>
                <span 
                  v-else
                  v-bind="props"
                >
                  <span v-html="header.text">
                  </span>
                  <span
                    v-show="(isHovering || header.key === pagination.sortBy) && header.sortable != false"
                    @click="header.sortable != false ? changeSort(header.key) : ''"
                    :class="[
                      'header-sort',
                      pagination.descending ? 'desc' : 'asc',
                    ]"
                  >
                    <VIcon class="tabler-caret-up-filled" />
                    <VIcon class="tabler-caret-down-filled" />
                  </span>
                </span>
              </v-hover>
              </th>
            </template>
          </Draggable>
        </template>
        <template v-slot:item="{ item }">
          <tr>
            <td
              v-for="(header, key) in computedHeaders"
              :key="key"
              :class="['t-body py-2', header.bodyClass]"
            >
              <slot
                v-if="header.renderSlot"
                :name="header.renderSlot"
                :class="[header.wrapperClass]"
                :style="header.style"
                v-bind:item="item"
              ></slot>
              <div v-else-if="header.renderSelectRow">
                <v-checkbox-btn
                  v-model="item.selected"
                ></v-checkbox-btn>
              </div>
              <UserAvatar 
                v-else-if="header.renderAvatar"
                :showName="header.showName ?? true"
                :user="renderItemProperty(item, header.key)"
              />
              <div
                v-else
                :class="[
                  header.wrapperClass,
                  header.wrapperClass === 'line-clamp-2' ? 'cursor-pointer' : ''
                ]"
                :style="header.style"
                :title="header.wrapperClass === 'line-clamp-2' 
                        ? renderNormalItem(header, item, key) : ''" 
                v-html="renderNormalItem(header, item, key)"
              >
              </div>
              
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <p class="mt-3">{{ noResultText ?? $gettext('No results found!') }}</p>
        </template>
        <template v-slot:bottom></template>
        <template v-slot:body.append v-if="isReportTable && totalRow.length > 0">
          <tr class="totalRow">
              <th class="pe-0" v-for="totalColumn in totalRow">{{ totalColumn }}</th>
          </tr>
        </template>
        <template v-slot:loading>
          <div ref="loadingText">{{ $gettext('Loading... Please wait') }}</div>
        </template>
      </VDataTable>
    </VCard>
    <!-- Pagination -->
    <div
      class="px-4 table-pagination v-card--variant-elevated"
      v-if="showPaging && !showPureArray"
    >
      <div
        class="virtual-vertical-scroll"
        ref="virtualScroll"
        v-show="verticalScroll && !loading"
        v-scroll.self="onVerticalScroll"
      >
        <div
          class="dummy"
          :style="{
            width: verticalScroll + 'px'
          }"
        ></div>
      </div>
      <span v-translate v-if="!showPureArray">Show</span>
      <v-select
        v-if="!showPureArray"
        :items="pagination.rowsPerPageItems"
        v-model="pagination.rowsPerPage"
        @update:modelValue="fetchData()"
        class="d-flex flex-grow-0 mx-2 width-60 inline"
        outlined hide-details density="compact"
      />
      <template v-if="$vuetify.display.smAndUp">
        <span>{{ $gettext('Total') }}</span>&nbsp;<span>{{ totalItems }}</span>&nbsp;{{ $gettext('item(s)') }}
      </template>
      <v-pagination
        v-if="state.items.length > 0 && !showPureArray"
        v-model="pagination.page"
        :length="totalPages"
        :total-visible="(isReportTable || $vuetify.display.mdAndDown) ? 4 : 8"
        @update:modelValue="fetchData(true)"
        class="d-inline-block ml-2"
        density="compact"
      />
    </div>
  </div>
</template>
<style lang="scss">
@use "@configured-variables" as variables;

.v-data-table {
  > .v-table__wrapper {
    overflow: hidden;
    margin-block-end: -35px;

    > table {
      > tbody {
        transform: translateY(-48px);
      }

      > tbody > tr {
        > td {
          block-size: 10px !important;
          border-block-end: 1px solid rgba(0, 0, 0, 6%) !important;
          padding-block: 8px;
          padding-inline: 16px 0;
          
          &:first-child {
            padding-inline-start: 16px;
          }

          &.text-center {
            padding-inline-start: 0;
          }

          .text-no-wrap {
            overflow: hidden;
            max-inline-size: 250px;
            text-overflow: ellipsis;
          }
          
          &.selectCell + td {
            padding-inline: 0 0;
          }
        }

        /* stylelint-disable-next-line no-descending-specificity */
        &:last-child > td {
          border-block-end: none !important;
        }

      }

      thead {
        background-color: var(--v-secondary-base);

        th {
          position: relative;
          font-size: 0.7rem;
          font-weight: 600 !important;
          letter-spacing: 0;
          padding-inline: 16px 0;

          &.sortable {
            padding-inline-end: 0;

            & > span {
              position: relative;
              cursor: pointer;
              text-transform: uppercase;
            }

            .header-sort {
              position: absolute;
              color: rgb(var(--v-theme-primary));

              > i:nth-child(1) {
                position: absolute;
                font-size: 12px;
              }

              > i:nth-child(2) {
                font-size: 12px;
                transform: translateY(1px);
              }

              &.asc {
                > i:nth-child(1) {
                  opacity: 0.5;
                }
              }

              &.desc {
                > i:nth-child(2) {
                  opacity: 0.5;
                }
              }
            }

            &.text-right {
              .header-sort {
                inset-inline-end: 100%
              }
            }
          }

          &:first-child {
            padding-inline-start: 16px;
          }

          &.selectCell + th {
            padding-inline: 0 0;
          }
        }
      }
  
      td.t-body {
        white-space: nowrap;
      }

      .v-data-table-progress {
        transform: translateY(-48px);
      }
    }
  }

  &.has-verticalScroll {
    .v-table__wrapper {
      overflow: auto;
    }
  }

  &.lastColumnSticky {
    th:last-child:not(:first-child),
    td:last-child:not(:first-child) {
      position: sticky;
      background-color: rgb(var(--v-theme-surface), 0.9);
      box-shadow: -3px 0 2px 1px rgba(0,0,0,3%);
      inset-inline-end: 0;
      text-align: end;
      white-space: nowrap;
    }
  }

  .real-header {
    position: relative;
    z-index: 1;
    background-color: rgb(var(--v-theme-surface), 0.9);
    transform: translateY(-48px);
  }

  &.isReportTable {
    > .v-table__wrapper {
      overflow: scroll;
      margin-block-end: 0;

      > table > tbody {
        transform: translateY(0);
      }

      > table > tbody > tr > td.t-body,
      > table > tbody > tr > td.t-body > div {
        white-space: normal;
      }

      > table > tbody > tr > td:last-child {
        padding-inline-end: 22px;
      }

      > table > thead > tr > th:last-child {
        padding-inline-end: 22px;
      }

      > table > tbody > tr > td.t-body > div {
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
      }
    }

    .real-header {
      transform: translateY(0);
    }
    
    .totalRow {
      position: sticky;
      background-color: rgb(var(--v-theme-surface), 0.9);
      box-shadow: 0 1px 0 1px #f0f0f0 inset;
      inset-block-end: 0;
    }
  }
}

.table-pagination {
  position: sticky;
  display: flex;
  align-items: center;
  background-color: rgb(var(--v-theme-surface), 0.9);
  block-size: 50px;
  border-block-start: 1px solid rgba(0, 0, 0, 6%) !important;
  inset-block-end: 0;
  inset-inline: 0;
  inset-inline-end: 1rem;
  line-height: 50px;

  .v-pagination {
    li {
      transform: translateY(-2px);

      button,
      button.v-pagination__item {
        .v-icon {
          font-size: 14px;
        }

        &.primary {
          border-color: var(--v-primary-base);
          background-color: transparent !important;
          color: var(--v-primary-base);
        }

        &.v-pagination__navigation {
          inline-size: 24px;
        }
      }

      .v-pagination__more {
        line-height: 32px;
      }
    }
  }

  .v-pagination__navigation--disabled {
    opacity: 0.4;
  }
}

.layout-wrapper.layout-nav-type-vertical {
  &:not(.layout-overlay-nav) {
    .table-pagination {
      inset-inline-start: calc(variables.$layout-vertical-nav-width + 1rem);
    }
  }

  &.layout-vertical-nav-collapsed {
    .table-pagination {
      inset-inline-start: calc(variables.$layout-vertical-nav-collapsed-width + 1rem);
    }
  }
}

.selectActions {
  position: absolute;
  z-index: 1;
  display: flex;
  background: rgb(var(--v-theme-surface), 1);
  inset-block-start: 8px;
  inset-inline-start: 40px;
  padding-block: 0;
  padding-inline: 0 1rem;

  /* stylelint-disable-next-line no-descending-specificity */
  & > button {
    margin-inline-end: 8px;
  }
}

.v-data-table-rows-no-data {
  p {
    inline-size: calc(100vw - 260px);
  }
}
</style>
