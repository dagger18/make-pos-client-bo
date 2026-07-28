<script setup>
import { getTitle as getActivityTitle } from '@/config/enums/ShipmentActivityType';
import { printDateTime } from '@/services/CommonService';
// ShipmentService removed - freight-specific service
const ShipmentService = null;

const props = defineProps({
  shipment: { type: Object, default: () => ({}) }
})

const KEYS = ['type', 'subEntityType', 'subEntityId', 'changes', 'timestamp', 'userId']

const activities = ref([])
const usersMap = ref({})

onMounted(async () => {
  const { activities: raw, users } = await ShipmentService.getActivities(props.shipment.id)
  usersMap.value = Object.fromEntries(users.map(u => [u.id, u]))
  activities.value = raw
    .map(arr => Object.fromEntries(KEYS.map((key, i) => [key, arr[i]])))
    .reverse()
})

function getUser(userId) {
  return usersMap.value[userId] ?? { firstName: '', lastName: '', logoThumbnailPath: null }
}
</script>
<template>
<VRow>
  <VCol cols="6">
  <VCard class="pt-6">
    <VTimeline
      density="compact"
      align="start"
      truncate-line="both"
      class="v-timeline-density-compact"
    >
      <VTimelineItem
        dot-color="primary"
        size="x-small"
        v-for="activity in activities"
      >
        <div class="d-flex flex-nowrap ms-n3 mt-n3">
          <UserAvatar
            size="38"
            class="me-3 mt-1"
            :user="getUser(activity.userId)"
          />

          <span>
            <span class="app-timeline-title">
              {{ getActivityTitle(activity.type, activity, shipment) }}
            </span>
            <p class="app-timeline-text mb-2">
              {{ getUser(activity.userId).firstName }} {{ getUser(activity.userId).lastName }} at {{ printDateTime(activity.timestamp, 'DD/MM/YYYY HH:mm:ss') }}
            </p>
          </span>
        </div>
      </VTimelineItem>
    </VTimeline>
  </VCard>
  </VCol>
  <VCol cols="6">

  </VCol>
</VRow>

</template>
