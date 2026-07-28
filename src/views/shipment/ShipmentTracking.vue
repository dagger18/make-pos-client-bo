<script setup>
import ShipmentActivities from './ShipmentActivities.vue';
import ShipmentMilestones from './ShipmentMilestones.vue';
import ShipmentNotes from './ShipmentNotes.vue';
import ShipmentTasks from './ShipmentTasks.vue';
import ShipmentTrackingSubscriptions from './ShipmentTrackingSubscriptions.vue';

const props = defineProps({
  shipment: { type: Object, default: () => ({}) },
  currentTab2: { type: String, default: 'milestones' },
})
const emit = defineEmits(['tab2Changed'])
const currentTab = ref(props.currentTab2)
const tabs = [
  { icon: 'tabler-flag-check',          title: $gettext('Milestones'),    component: ShipmentMilestones,            value: 'milestones' },
  { icon: 'tabler-checklist',           title: $gettext('Tasks'),         component: ShipmentTasks,                 value: 'tasks' },
  { icon: 'tabler-notes',               title: $gettext('Notes'),         component: ShipmentNotes,                 value: 'notes' },
  { icon: 'tabler-activity-heartbeat',  title: $gettext('Activities'),    component: ShipmentActivities,            value: 'activities' },
  { icon: 'tabler-antenna',             title: $gettext('Subscriptions'), component: ShipmentTrackingSubscriptions, value: 'subscriptions' },
]
function onTabChange(tab2) {
  emit('tab2Changed', ['tracking', tab2])
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
        <VIcon :icon="tab.icon" class="me-2" size="21" />{{ tab.title }}
      </VTab>
    </VTabs>
    <VWindow v-model="currentTab">
      <VWindowItem
        v-for="tab in tabs"
        :key="tab.value"
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
