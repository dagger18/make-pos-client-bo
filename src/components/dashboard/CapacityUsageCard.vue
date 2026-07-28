<script setup>
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

defineProps({
  items:    { type: Array,  default: () => [] },
  planName: { type: String, default: null },
})

const TYPE_ICONS = {
  network_bandwidth:   'tabler-wifi',
  email_send:          'tabler-mail',
  reset_password:      'tabler-lock',
  file_storage:        'tabler-database',
  document_operations: 'tabler-file-text',
  max_users:           'tabler-users',
  max_quotes:          'tabler-file-dollar',
  max_shipments:       'tabler-ship',
}

const typeLabels = computed(() => ({
  network_bandwidth:   $gettext('Network Bandwidth'),
  email_send:          $gettext('Email Send'),
  reset_password:      $gettext('Reset Password'),
  file_storage:        $gettext('File Storage'),
  document_operations: $gettext('Document Operations'),
  max_users:           $gettext('Max Users'),
  max_quotes:          $gettext('Max Quotes'),
  max_shipments:       $gettext('Max Shipments'),
}))

function typeIcon(type) {
  return TYPE_ICONS[type] ?? 'tabler-chart-bar'
}

function typeLabel(item) {
  return typeLabels.value[item.type] ?? item.label
}

function displayedCurrent(item) {
  if (!item.displayLimit || item.displayLimit <= item.limit || !item.limit) {
    return item.current
  }
  return item.current + ((item.displayLimit - item.limit) / (item.limit ** 2)) * (item.current ** 2)
}

function usagePercent(item) {
  if (item.displayLimit && item.displayLimit > item.limit && item.limit) {
    return Math.min(100, Math.round((displayedCurrent(item) / item.displayLimit) * 100))
  }
  if (!item.limit) return 0
  return Math.min(100, Math.round((item.current / item.limit) * 100))
}

function usageColor(item) {
  const pct = usagePercent(item)
  if (pct >= 90) return 'error'
  if (pct >= 70) return 'warning'
  return 'success'
}

function formatValue(value, unit) {
  return unit ? `${Math.round(value)} ${unit}` : Math.round(value)
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ $gettext('Plan Usage') }}</VCardTitle>
      <VCardSubtitle v-if="planName">{{ planName }}</VCardSubtitle>
    </VCardItem>
    <VCardText>
      <VRow>
        <VCol
          v-for="item in items"
          :key="item.type"
          cols="12"
        >
          <div class="d-flex align-center gap-3">
            <VAvatar
              size="36"
              variant="tonal"
              :color="usageColor(item)"
              rounded
            >
              <VIcon :icon="typeIcon(item.type)" size="20" />
            </VAvatar>
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2 text-truncate">
                  {{ typeLabel(item) }}
                  <span
                    v-if="item.period === 'per_day'"
                    class="text-disabled text-caption ms-1"
                  >({{ $gettext('today') }})</span>
                </span>
                <span class="text-caption font-weight-medium ms-2 text-no-wrap">
                  {{ formatValue(displayedCurrent(item), item.unit) }} / {{ formatValue(item.displayLimit ?? item.limit, item.unit) }}
                </span>
              </div>
              <VProgressLinear
                :model-value="usagePercent(item)"
                :color="usageColor(item)"
                rounded
                height="5"
              />
            </div>
          </div>
        </VCol>
      </VRow>
      <div
        v-if="items.length === 0"
        class="text-body-2 text-disabled text-center py-4"
      >
        {{ $gettext('No capacity limits configured') }}
      </div>
    </VCardText>
  </VCard>
</template>
