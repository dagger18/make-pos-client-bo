<script setup>
import Details from './Details.vue';
import Price from './Price.vue';
import Quote from './Quote.vue';
const route = useRoute()
const props = defineProps({
  shipment: {type: Object, default: () => {}},
  currentTab2: {type: String, default: 'details'}
})
const currentTab = ref('details')
const tabs = [
  {
    icon: 'tabler-article', 
    title: $gettext('Details'), 
    component: Details,
    value: 'details'
  },
  {
    icon: 'tabler-currency-dollar', 
    title: $gettext('Price'), 
    component: Price,
    value: 'price'
  },
  {
    icon: 'tabler-message-2-dollar', 
    title: $gettext('Quote'), 
    component: Quote,
    value: 'quote'
  },
]
const emit = defineEmits(['tab2Changed', 'shipmentChanged'])
function onTabChange(tab2) {
  emit('tab2Changed', ['pricing', tab2])
}
onMounted(() => {
  currentTab.value = props.currentTab2
})
</script>
<template>
<div class="float-right mt-0" style="border-block-end: 1px solid rgba(47,43,61,16%);padding-block-end: 5px;">
  <VChip label variant="tonal" color="primary">
    <b class="text-disabled me-4">{{ $gettext('Quote ID') }}</b>
    <b>{{ shipment.quote.code }}</b></VChip>
</div>
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
