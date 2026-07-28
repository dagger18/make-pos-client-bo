<script setup>
import VolumeItems from '@/components/common/VolumeItems.vue';
import { findByValue as findQuoteStatus, enums as QuoteStatus } from '@/config/enums/QuoteStatus';
import { findByValue, getList, slugToValue } from '@/config/enums/TransportType';
import { filterConfigs, headers } from '@/config/tables/Quote';
import EntityService from '@/services/QuoteService';
import { useAppStore } from '@/stores/appStore';
import QuoteForm from '@/views/quote/QuoteForm.vue';
import QuotePreview from '@/views/quote/QuotePreview.vue';
import { can } from '@layouts/plugins/casl';
definePage({ 
  meta: { action: 'GET', subject: 'Quote' },
})
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const preview = ref(null)
const currentTransportType = ref(slugToValue(route.params.transportType))
const buttons = computed(() => {
  return can('POST', 'Quote') ? [
     {
      text: $gettext('Add Quote'),
      func: form.value?.setEntity
    }
  ] : []
})
const apiCallParam = computed(() => {
  return {'filter_transportType': currentTransportType.value}
})
async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
async function makeShipment(item) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Make Shipment'),
    $gettext('Are you sure you want to convert this quote into a shipment?'),
    { color: 'warning' }
  )
  if (!confirmed) return
  await EntityService.makeShipment(item.id)
  table.value.fetchData()
}
watch(() => route, () => {
  if(route.name !== 'quote-transport-type') return
  currentTransportType.value = slugToValue(route.params.transportType)
  nextTick(() => {
    table.value.fetchData()
  })
}, {
  deep: true
})
function openUpdateFromPreview(quote) {
  form.value.setEntity(quote)
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :apiCallParam="apiCallParam"
    :pageTitle="$gettext('Quotes')"
  >
    <template v-slot:beforeTable>
      <BtnSelectGroup  class="mt-4 mb-2"
        :modelValue="route.params.transportType"
        :valueKey="'slug'" variant="outlined"
        @update:modelValue="$router.push({ 
          name: 'quote-transport-type', 
          params: {
            transportType: $event
          } 
        })"
        :items="getList" 
      />
    </template>
    <template #code="{item}">
      <VIcon :icon="findByValue(item.transportType).icon" size="15" class="mt-n1 me-1"/>
      {{ findByValue(item.transportType).title }}<br>
      {{ item.code }}
    </template>
    <template #cargoVolume="{item}">
      <VolumeItems v-bind="item" />
    </template>
    <template #route="{item}">
      <div class="position-relative d-flex">
        <span class="d-inline-block text-warning">
          {{ item.originPort?.codeFull }}&nbsp;·&nbsp;
        </span>
        <span
          class="d-inline-block text-truncate"
          style="max-inline-size: 90px;"
          :title="item.originPort?.name"
        >{{ item.originPort?.name }}</span>
        <VIcon
          icon="tabler-arrow-move-down" size="28" color="warning"
          style="
            position: absolute;
            inset-block-start: 5px;
            inset-inline-start: -21px;
          "
        />
      </div>
      <div class="position-relative d-flex">
        <span class="d-inline-block text-warning">
          {{ item.destinationPort?.codeFull }}&nbsp;·&nbsp;
        </span>
        <span
          class="d-inline-block text-truncate"
          style="max-inline-size: 90px;"
          :title="item.destinationPort?.name"
        >{{ item.destinationPort?.name }}</span>
      </div>
    </template>
    <template #status="{item}">
      <VChip class="d-flex" :color="findQuoteStatus(item.status).color">
        {{ findQuoteStatus(item.status).title }}
      </VChip>
    </template>
    <template #action="{ item }">
      <div class="mx-2">
      <SubmitBtn
        v-if="item.status !== QuoteStatus.Booked"
        @click="makeShipment(item)"
        :title="$gettext('Make Shipment')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        :autoQueue="false"
        size="x-small"
      >
        <VIcon icon="tabler-ship" size="18"/>
      </SubmitBtn>
      <v-btn
        v-if="item.status !== QuoteStatus.Booked"
        @click="editEntity(item.id)"
        :title="$gettext('edit')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        size="x-small"
      >
        <VIcon icon="tabler-pencil" size="18"/>
      </v-btn>
      <SubmitBtn
        v-if="$can('DELETE', 'Quote') && item.status !== QuoteStatus.Booked"
        @click="table.handleDelete(item, $refs['delete-' + item.id])"
        :title="$gettext('delete')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        :autoQueue="false"
        :ref="'delete-' + item.id"
        size="x-small"
      >
        <VIcon icon="tabler-trash" size="18"/>
      </SubmitBtn>
      <v-btn
        @click="preview.setEntity(item.id)"
        :title="$gettext('preview')"
        class="mx-1 px-0" variant="text" style="inline-size: 20px; min-inline-size: unset;"
        size="x-small"
      >
        <VIcon icon="tabler-eye" size="18"/>
      </v-btn>
      </div>
    </template>
  </AppTable>
  <QuoteForm 
    ref="form" 
    :currentTransportType="currentTransportType"
    @entitySubmitted="$refs.table.fetchData()"
  />
  <QuotePreview
    ref="preview" 
    @openUpdate="openUpdateFromPreview"
  />
</template>
