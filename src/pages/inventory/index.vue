<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Inventory</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="addDialog = true">
        Add Product
      </VBtn>
    </VCardTitle>

    <VCardText class="pb-0">
      <VRow dense>
        <VCol cols="12" sm="6">
          <VTextField v-model="filters.q" label="Search by name or SKU" clearable density="compact"
            prepend-inner-icon="tabler-search" @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="3" class="d-flex align-center">
          <VCheckbox v-model="filters.low_stock" label="Low stock only" density="compact" hide-details
            @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="3" class="d-flex align-center justify-end">
          <VBtn variant="tonal" size="small" @click="clearFilters">Clear</VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      item-value="id"
    >
      <template #item.productName="{ item }">
        <span class="font-weight-medium">{{ item.productName }}</span>
        <div class="text-caption text-disabled">{{ item.productSku }}</div>
      </template>

      <template #item.quantity="{ item }">
        <div class="d-flex align-center gap-2">
          <span class="font-weight-bold text-h6">{{ item.quantity }}</span>
          <VChip v-if="item.isLowStock" size="x-small" color="error">Low Stock</VChip>
        </div>
      </template>

      <template #item.lowStockThreshold="{ item }">
        {{ item.lowStockThreshold ?? '—' }}
      </template>

      <template #item.actions="{ item }">
        <VBtn size="small" variant="tonal" color="primary" @click="openAdjust(item)">
          Adjust
        </VBtn>
        <VBtn icon size="small" variant="text" class="ml-1" :to="{ name: 'inventory-id', params: { id: item.id } }">
          <VIcon icon="tabler-history" />
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- ── Add Product Dialog ─────────────────────────────────────── -->
  <VDialog v-model="addDialog" max-width="480">
    <VCard>
      <VCardTitle>Add Product to Inventory</VCardTitle>
      <VCardText>
        <VAutocomplete
          v-model="addForm.product"
          :items="productOptions"
          item-title="name"
          item-value="id"
          label="Product"
          density="compact"
          class="mb-3"
          return-object
          @update:search="searchProducts"
        />
        <VTextField v-model.number="addForm.initial_quantity" label="Initial Quantity"
          type="number" min="0" density="compact" class="mb-3" />
        <VTextField v-model.number="addForm.low_stock_threshold" label="Low Stock Threshold (optional)"
          type="number" min="0" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="addDialog = false">Cancel</VBtn>
        <VBtn color="primary" :disabled="!addForm.product" @click="submitAdd">Add</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Adjust Dialog ──────────────────────────────────────────── -->
  <VDialog v-model="adjustDialog" max-width="420">
    <VCard>
      <VCardTitle>Adjust Stock — {{ adjustTarget?.productName }}</VCardTitle>
      <VCardText>
        <VBtnToggle v-model="adjustForm.type" mandatory class="mb-4" density="compact">
          <VBtn value="receive">Receive</VBtn>
          <VBtn value="adjustment">Adjust</VBtn>
          <VBtn value="return">Return</VBtn>
          <VBtn value="write_off">Write Off</VBtn>
        </VBtnToggle>
        <VTextField
          v-model.number="adjustForm.quantity_delta"
          label="Quantity Change"
          type="number"
          density="compact"
          class="mb-3"
          :hint="adjustHint"
          persistent-hint
        />
        <VTextField v-model="adjustForm.notes" label="Notes (optional)" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="adjustDialog = false">Cancel</VBtn>
        <VBtn color="primary" :disabled="adjustForm.quantity_delta === 0" @click="submitAdjust">Confirm</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import InventoryService from '@/services/InventoryService'
import CatalogService from '@/services/CatalogService'

const items   = ref([])
const loading = ref(false)
const filters = ref({ q: '', low_stock: false })

// Add product dialog
const addDialog      = ref(false)
const productOptions = ref([])
const addForm        = ref({ product: null, initial_quantity: 0, low_stock_threshold: null })

// Adjust dialog
const adjustDialog = ref(false)
const adjustTarget = ref(null)
const adjustForm   = ref({ type: 'receive', quantity_delta: 0, notes: '' })

const headers = [
  { title: 'Product', key: 'productName', sortable: true },
  { title: 'Quantity', key: 'quantity', sortable: true },
  { title: 'Low Stock At', key: 'lowStockThreshold', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

const adjustHint = computed(() => {
  const delta = adjustForm.value.quantity_delta
  if (!adjustTarget.value || delta === 0) return ''
  const newQty = adjustTarget.value.quantity + delta
  return `New quantity: ${newQty}`
})

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.q) params.set('q', filters.value.q)
  if (filters.value.low_stock) params.set('low_stock', '1')
  const res = await InventoryService.listStock(params.toString())
  items.value = res?.list ?? res ?? []
  loading.value = false
}

const clearFilters = () => {
  filters.value = { q: '', low_stock: false }
  load()
}

const searchProducts = async (q) => {
  if (!q || q.length < 2) return
  const res = await CatalogService.listProducts(`q=${encodeURIComponent(q)}&active=1`)
  productOptions.value = res?.list ?? res ?? []
}

const submitAdd = async () => {
  const payload = {
    product_id:       addForm.value.product?.id,
    initial_quantity: addForm.value.initial_quantity || 0,
    low_stock_threshold: addForm.value.low_stock_threshold || null,
  }
  await InventoryService.addProduct(payload)
  addDialog.value = false
  addForm.value   = { product: null, initial_quantity: 0, low_stock_threshold: null }
  await load()
}

const openAdjust = (item) => {
  adjustTarget.value = item
  adjustForm.value   = { type: 'receive', quantity_delta: 0, notes: '' }
  adjustDialog.value = true
}

const submitAdjust = async () => {
  await InventoryService.adjust(adjustTarget.value.id, adjustForm.value)
  adjustDialog.value = false
  await load()
}

onMounted(load)
</script>
