<script setup>
import { enums as TransportType } from '@/config/enums/TransportType';
import { can } from '@layouts/plugins/casl';
import Booking from './Booking.vue';
import Instruction from './Instruction.vue';
import InstructionAir from './InstructionAir.vue';
import InstructionPreview from './InstructionPreview.vue';
import Order from './Order.vue';
const route = useRoute()
const props = defineProps({
  shipment: {type: Object, default: () => {}},
  currentTab2: {type: String, default: 'order'}
})
const currentTab = ref('order')
const tabs = [
  {
    icon: 'tabler-shopping-cart', 
    title: $gettext('Order'), 
    component: Order,
    value: 'order'
  },
  can('MANAGE_Booking', 'Shipment')
  && props.shipment.quote.transportType !== TransportType.Ocean
    ? {
      icon: 'tabler-ticket', 
      title: $gettext('Booking'), 
      component: Booking,
      value: 'booking'
    } : null,
  can('MANAGE_Instruction', 'Shipment')
    ? {
      icon: 'tabler-file-info',
      title: $gettext('Shipping Instruction'),
      component: props.shipment.quote.transportType === TransportType.AIR
                  ? InstructionAir : Instruction,
      value: 'instruction'
    } : null,
  can('MANAGE_Instruction', 'Shipment')
    ? {
      icon: 'tabler-file-description',
      title: $gettext('HBL Preview'),
      component: InstructionPreview,
      value: 'hbl-preview'
    } : null,
].filter(e => e)
const emit = defineEmits(['tab2Changed'])
function onTabChange(tab2) {
  emit('tab2Changed', ['info', tab2])
}
onMounted(() => {
  currentTab.value = props.currentTab2
})
</script>
<template>
  <div>
<VTabs 
  v-model="currentTab" 
  density="compact"
  @update:modelValue="onTabChange"
>
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
        @shipmentChanged="$emit('shipmentChanged')"
      />
    </VWindowItem>
  </VWindow>
</div>
</template>
