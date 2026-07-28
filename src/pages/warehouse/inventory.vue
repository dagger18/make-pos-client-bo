<script setup>
import { filterConfigs, headers } from '@/config/tables/WarehouseInventory'
import WarehouseFacilityService from '@/services/WarehouseFacilityService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'Warehouse' } })

const { $gettext } = useGettext()

const table               = ref(null)
const facilities          = ref([])
const selectedFacilityId  = ref(null)

const conditionColor = {
  GOOD: 'success', DAMAGED: 'error', SHORT: 'warning',
  EXCESS: 'info', WET: 'warning', CONTAMINATED: 'error',
}

const inventoryService = computed(() => ({
  list: () => selectedFacilityId.value
    ? WarehouseFacilityService.inventory(selectedFacilityId.value)
    : Promise.resolve([]),
}))

async function loadFacilities() {
  const res = await WarehouseFacilityService.list()
  facilities.value = (res ?? []).filter(f => f.isActive)
  if (facilities.value.length && !selectedFacilityId.value) {
    selectedFacilityId.value = facilities.value[0].id
    await table.value?.fetchData()
  }
}

watch(selectedFacilityId, () => table.value?.fetchData())

onMounted(loadFacilities)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="inventoryService"
    :pageTitle="$gettext('CFS Inventory')"
  >
    <template #tableAction>
      <VSelect
        v-model="selectedFacilityId"
        :items="facilities"
        item-title="name"
        item-value="id"
        :label="$gettext('Facility')"
        density="compact"
        style="max-width: 260px"
        hide-details
      />
    </template>

    <template #condition="{ item }">
      <VChip :color="conditionColor[item.condition_code] ?? 'default'" size="x-small" label>
        {{ item.condition_code }}
      </VChip>
    </template>
  </AppTable>
</template>
