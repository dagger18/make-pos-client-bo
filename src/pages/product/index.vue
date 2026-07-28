<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Products</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" :to="{ name: 'product-id', params: { id: 'new' } }">
        Add Product
      </VBtn>
    </VCardTitle>

    <!-- Filters -->
    <VCardText class="pb-0">
      <VRow dense>
        <VCol cols="12" sm="4">
          <VTextField v-model="filters.q" label="Search name or SKU" clearable density="compact"
            prepend-inner-icon="tabler-search" @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="3">
          <VSelect v-model="filters.category_id" :items="categoryOptions" label="Category"
            density="compact" clearable @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="2">
          <VSelect v-model="filters.type" :items="typeOptions" label="Type"
            density="compact" clearable @update:modelValue="load" />
        </VCol>
        <VCol cols="6" sm="3">
          <VSelect v-model="filters.active" :items="activeOptions" label="Status"
            density="compact" clearable @update:modelValue="load" />
        </VCol>
      </VRow>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="products"
      :loading="loading"
      item-value="id"
    >
      <template #item.image="{ item }">
        <VImg v-if="item.image_url" :src="item.image_url" width="40" height="40" class="rounded" cover />
        <VIcon v-else icon="tabler-photo" size="40" color="secondary" />
      </template>

      <template #item.type="{ item }">
        <VChip size="small" :color="item.type === 'food' ? 'warning' : 'primary'" label>
          {{ item.type }}
        </VChip>
      </template>

      <template #item.price="{ item }">
        {{ Number(item.price).toFixed(2) }}
      </template>

      <template #item.active="{ item }">
        <VSwitch :model-value="item.active" density="compact" hide-details
          @update:modelValue="toggleActive(item)" />
      </template>

      <template #item.actions="{ item }">
        <VBtn icon size="small" variant="text"
          :to="{ name: 'product-id', params: { id: item.id } }">
          <VIcon icon="tabler-edit" />
        </VBtn>
        <VBtn icon size="small" variant="text" color="error" @click="deleteProduct(item)">
          <VIcon icon="tabler-trash" />
        </VBtn>
      </template>
    </VDataTable>
  </VCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CatalogService from '@/services/CatalogService'

const products = ref([])
const loading = ref(false)
const categoryOptions = ref([{ title: 'All', value: null }])
const filters = ref({ q: '', category_id: null, type: null, active: null })

const typeOptions = [
  { title: 'All types', value: null },
  { title: 'Retail', value: 'retail' },
  { title: 'Food', value: 'food' },
]
const activeOptions = [
  { title: 'All', value: null },
  { title: 'Active', value: '1' },
  { title: 'Inactive', value: '0' },
]
const headers = [
  { title: '', key: 'image', sortable: false, width: '60px' },
  { title: 'Name', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Category', key: 'category_name' },
  { title: 'Type', key: 'type' },
  { title: 'Price', key: 'price' },
  { title: 'Active', key: 'active', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

const load = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filters.value.q) params.set('q', filters.value.q)
  if (filters.value.category_id) params.set('category_id', filters.value.category_id)
  if (filters.value.type) params.set('type', filters.value.type)
  if (filters.value.active !== null && filters.value.active !== undefined) params.set('active', filters.value.active)

  const res = await CatalogService.listProducts(params.toString())
  products.value = res?.list ?? res ?? []
  loading.value = false
}

const loadCategories = async () => {
  const res = await CatalogService.listCategories()
  const cats = res?.list ?? res ?? []
  categoryOptions.value = [
    { title: 'All categories', value: null },
    ...cats.map(c => ({ title: c.name, value: c.id })),
  ]
}

const toggleActive = async (item) => {
  await CatalogService.updateProduct({ id: item.id, active: !item.active })
  await load()
}

const deleteProduct = async (item) => {
  if (!confirm(`Delete "${item.name}"?`)) return
  await CatalogService.deleteProduct(item.id)
  await load()
}

onMounted(() => {
  load()
  loadCategories()
})
</script>
