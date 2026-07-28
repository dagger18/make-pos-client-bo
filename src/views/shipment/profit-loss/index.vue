<script setup>
import { useAppStore } from '@/stores/appStore';
import Costs from './Costs.vue';
import OBO from './OBO.vue';
import Revenues from './Revenues.vue';
const props = defineProps({
  shipment: {type: Object, default: () => {}},
  currentTab2: {type: String, default: 'revenues'}
})
const route = useRoute()
const currentTab = ref('revenues')
const tabs = [
  {
    icon: 'tabler-mood-dollar', 
    title: $gettext('Revenues'), 
    component: Revenues,
    value: 'revenues'
  },
  {
    icon: 'tabler-mail-dollar', 
    title: $gettext('Costs'), 
    component: Costs,
    value: 'costs'
  },
  {
    icon: 'tabler-refresh', 
    title: $gettext('Pay-Collect On Behalf'), 
    component: OBO,
    value: 'obo'
  }/*,
  {
    icon: 'tabler-stack-push', 
    title: $gettext('Issue Combine'), 
    component: CombineInvoices,
    value: 'combine'
  },
  */
]
const rows = [
  [
    {title: $gettext('Revenue'), value: 'revenue'},
    {title: $gettext('Cost'), value: 'cost'},
    {title: $gettext('Profit'), value: 'profit'},
  ],[
    {title: $gettext('POBO'), value: 'pobo'},
    {title: $gettext('COBO'), value: 'cobo'},
  ]
]
const defaultCurrency = computed(() => {
  const appStore = useAppStore()
  const currentRate = appStore.exchangeRatesConfig
  if(!currentRate) return ''
  return currentRate.currency
})
const emit = defineEmits(['tab2Changed', 'shipmentChanged'])
function onTabChange(tab2) {
  emit('tab2Changed', ['profitloss', tab2])
}
onMounted(() => {
  currentTab.value = props.currentTab2
})
</script>
<template>
<VRow v-for="row in rows">
  <VCol cols="12" lg="4" v-for="column in row">
    <div class="text-center">
      <div class="text-h6 text-disabled">
        {{ $gettext('Total') + ' ' + column.title }}
        <b>({{ shipment[column.value].currency ?? defaultCurrency.code }})</b>
      </div>
      <div class="text-h4 font-weight-bold">
        {{ shipment[column.value].amount
            ? (1*shipment[column.value].amount)
                .toMoneyFormat(shipment[column.value].currency, false)
            : 0 }}
      </div>
    </div>
    
  </VCol>
</VRow><br/>
<VTabs v-model="currentTab" density="compact" @update:modelValue="onTabChange">
  <VTab 
    v-for="tab in tabs" 
    class="px-0 me-6 pb-2" 
    style="min-inline-size: unset;"
    :value="tab.value"
  >
    <VIcon :icon="tab.icon" class="me-2" size="21"/>{{  tab.title  }}
  </VTab>
</VTabs>
  <VWindow v-model="currentTab">
    <VWindowItem
      v-for="tab in tabs"
      :key="tab.icon"
      :value="tab.value"
      transition="fade-transition" 
      reverse-transition="fade-transition"
    >
      <component 
        :is="tab.component"
        :shipment="props.shipment"
        @shipmentChanged="emit('shipmentChanged')"
      />
    </VWindowItem>
  </VWindow>
</template>
