<script setup>
import { useAppStore } from '@/stores/appStore';
import { useGettext } from "vue3-gettext";
const props = defineProps({
  headers: { type: Array, default: () => [] },
  itemKey: { type: String, default: 'id' },
  stickyHeader: { type: Boolean, default: true },
  items: {type: Array, default: () => []}
})

const state = reactive({
  items: JSON.parse(JSON.stringify(props.items))
})
watch(() => props.items, (newItems) => {
  state.items = JSON.parse(JSON.stringify(newItems))
}, { deep: true })
const verticalScroll = ref(null)
const table = ref(null)
const dummyHeader = ref(null)
const realHeader = ref(null)
const { $gettext } = useGettext();

const removeItem = (item) => {
  const index = state.items.findIndex(i => i.id === item.id)
  if (index === -1) return
  state.items.splice(index, 1)
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
const checkVerticalScroll = () => {
  console.log('checkVerticalScroll', table.value)
  if(!table.value) return
  const tableWrapper = table.value.$el.querySelector('.v-table__wrapper')
  console.log('tableWrapper', tableWrapper, tableWrapper.scrollWidth, tableWrapper.clientWidth, state.items.length)
  if (((tableWrapper.scrollWidth - tableWrapper.clientWidth) > 15) && state.items.length > 0) {
    verticalScroll.value = tableWrapper.scrollWidth
  } else {
    verticalScroll.value = null
  }
}
const onVerticalScroll = (event) => {
  table.value.$el.querySelector('.v-table__wrapper').scrollLeft = event.target.scrollLeft
}
const checkHeaderY = () => {
  const viewPortY = dummyHeader.value.getBoundingClientRect().top
  if(viewPortY >= 0) {
    realHeader.value.style.transform = 'translateY(-48px)'
    return
  }
  realHeader.value.style.transform = 'translateY(' + (Math.abs(viewPortY) - 48) + 'px)'
}

window.addEventListener('resize', checkVerticalScroll)
window.addEventListener('scroll', checkHeaderY)

onUnmounted(() => {
  window.removeEventListener('resize', checkVerticalScroll)
  window.removeEventListener('scroll', checkHeaderY)
})

defineExpose({
  handleDelete,
  checkVerticalScroll
})
onMounted(() => {
  nextTick(() => {

    checkVerticalScroll()
  })
})
</script>
<template>
  <div class="table-wrapper">
    <VCard :elevation="0">
      <VCardText class="px-0 pt-4">
        <VRow>
          <VCol cols="auto">
            <slot name="title"></slot>
          </VCol>
          <VSpacer></VSpacer>
          <VCol cols="auto">
            <slot name="buttons"></slot>
          </VCol>
        </VRow>
      </VCardText>
      
      <VDivider />
      <VDataTable
        :headers="headers"
        :items="state.items"
        disable-pagination
        :item-key="itemKey"
        hide-default-footer
        hide-default-header
        ref="table"
        :itemsPerPage="-1"
        class="table-inline"
        :class="{'has-verticalScroll': !!(verticalScroll && verticalScroll.value)}"
      >
        <template v-slot:headers>
          <tr class="dummy-header" style="opacity: 0;" ref="dummyHeader">
            <th 
              v-for="(header, index) in headers"
              :key="index"  
              :class="[header.headerClass]"
            >
              <span v-html="header.text">
              </span>
            </th>
          </tr>
          <tr class="real-header" ref="realHeader">
            <v-hover
              v-for="(header, index) in headers"
              :key="index">
            <th :class="['column', header.headerClass]" v-html="header.text">
            </th>
            </v-hover>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr>
            <td
              v-for="(header, key) in headers"
              :key="key"
              :class="['t-body py-2', header.bodyClass]"
            >
              <slot
                v-if="header.renderSlot"
                :name="header.renderSlot"
                v-bind:item="item"
              ></slot>
              <UserAvatar 
                v-else-if="header.renderAvatar"
                :showName="header.showName ?? true"
                :user="item[header.key]"
              />
              <div 
                v-else-if="header.renderObject"
                :class="[header.wrapperClass]"
                :style="header.style"
                v-html="header.renderObject(item)"
              >
              </div>
              <div 
                v-else 
                v-html="item[header.key]"
              >
              </div>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <p class="mt-3">{{ $gettext('No results found!') }}</p>
        </template>
        <template v-slot:bottom></template>
      </VDataTable>
    </VCard>
    <!-- Pagination -->
    <div
      class="px-4 table-pagination v-card--variant-elevated"
      style="
    position: relative;
    inset-inline-start: 0;
"
      v-if="state.items.length > 0"
    >
      <div
        class="virtual-vertical-scroll"
        v-if="verticalScroll"
        v-scroll.self="onVerticalScroll"
      >
        <div
          class="dummy"
          :style="{
            width: verticalScroll + 'px'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@use "@configured-variables" as variables;

.v-data-table.table-inline {
  thead {
    background-color: var(--v-secondary-base);

    th {
      position: relative;
      font-size: 0.7rem;
      font-weight: 600 !important;

      &:last-child {
        position: sticky;
        background-color: rgb(var(--v-theme-surface), 0.9);
        box-shadow: -3px 0 2px 1px rgba(0,0,0,3%);
        inset-inline-end: 0;
        white-space: nowrap;
      }
    }
  }
  
  td.t-body {
    white-space: nowrap;
  }

  .v-table__wrapper {
    overflow: hidden;
    margin-block-end: -30px;
  }

  &.has-verticalScroll {
    .v-table__wrapper {
      overflow: auto;
    }
  }
}

.v-data-table.table-inline > .v-table__wrapper > table {
  > tbody {
    transform: translateY(-48px);
  }

  > tbody > tr {
    > td {
      block-size: 10px !important;
      border-block-end: 1px solid rgba(0, 0, 0, 6%) !important;
      padding-block: 8px;
      padding-inline: 8px 0;
      
      &:first-child {
        padding-inline-start: 0;
      }

      &:last-child {
        position: sticky;
        background-color: rgb(var(--v-theme-surface), 0.9);
        box-shadow: -3px 0 2px 1px rgba(0,0,0,3%);
        inset-inline-end: 0;
        padding-inline-end: 0 !important;
        text-align: end;
        white-space: nowrap;
      }

      &.text-center {
        padding-inline-start: 0;
      }

      .text-no-wrap {
        overflow: hidden;
        max-inline-size: 250px;
        text-overflow: ellipsis;
      }
    }

    &:last-child > td {
      border-block-end: none !important;
    }
  }

  > thead > tr > th {
    padding-inline: 8px 0;

    &:first-child {
      padding-inline-start: 0;
    }

    &:last-child {
      padding-inline-end: 0 !important;
    }
  }

  .v-data-table-progress {
    transform: translateY(-48px);
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

.real-header {
  position: relative;
  z-index: 1;
  background: white;
  transform: translateY(-48px);
}
</style>
