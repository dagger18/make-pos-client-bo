<template>
  <div v-if="loading" class="d-flex justify-center py-8">
    <VProgressCircular indeterminate />
  </div>

  <template v-else-if="detail">
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pa-4">
        <VBtn icon variant="text" :to="{ name: 'inventory' }" class="mr-2">
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <span>{{ detail.productName }}</span>
        <VChip size="small" class="ml-3" :color="detail.isLowStock ? 'error' : 'success'">
          {{ detail.quantity }} in stock
        </VChip>
        <VSpacer />
        <span class="text-caption text-disabled">SKU: {{ detail.productSku }}</span>
      </VCardTitle>
    </VCard>

    <VCard>
      <VCardTitle class="pa-4 text-subtitle-1 font-weight-bold">Movement History</VCardTitle>
      <VCardText class="pa-0">
        <VTable density="compact">
          <thead>
            <tr>
              <th>Type</th>
              <th class="text-right">Delta</th>
              <th>Notes</th>
              <th>By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in detail.movements" :key="m.id">
              <td>
                <VChip size="x-small" :color="typeColor(m.type)" label>{{ m.type }}</VChip>
              </td>
              <td class="text-right font-weight-medium"
                  :class="m.quantityDelta > 0 ? 'text-success' : 'text-error'">
                {{ m.quantityDelta > 0 ? '+' : '' }}{{ m.quantityDelta }}
              </td>
              <td class="text-disabled">{{ m.notes ?? '—' }}</td>
              <td>{{ m.createdBy?.name ?? '—' }}</td>
              <td>{{ m.createdAt }}</td>
            </tr>
            <tr v-if="!detail.movements?.length">
              <td colspan="5" class="text-center text-disabled py-6">No movements recorded</td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </template>

  <div v-else class="text-center text-disabled py-8">Stock level not found.</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import InventoryService from '@/services/InventoryService'

const route  = useRoute()
const detail = ref(null)
const loading = ref(false)

const typeColor = (type) => {
  const map = { receive: 'success', adjustment: 'info', return: 'warning', write_off: 'error' }
  return map[type] ?? 'default'
}

const load = async () => {
  loading.value = true
  try {
    detail.value = await InventoryService.getStock(route.params.id)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
