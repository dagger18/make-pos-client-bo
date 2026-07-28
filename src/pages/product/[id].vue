<template>
  <VCard :loading="loading">
    <VCardTitle class="pa-4">{{ isNew ? 'Add Product' : 'Edit Product' }}</VCardTitle>

    <VCardText>
      <VRow>
        <VCol cols="12" md="8">
          <VRow>
            <VCol cols="12">
              <VTextField v-model="form.name" label="Name *" />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField v-model="form.sku" label="SKU *" />
            </VCol>
            <VCol cols="12" sm="6">
              <VSelect v-model="form.type" :items="typeOptions" label="Type *" />
            </VCol>
            <VCol cols="12" sm="6">
              <VSelect v-model="form.category_id" :items="categoryOptions" label="Category" clearable />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model="form.price" label="Price *" type="number" step="0.01" prefix="$" />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model="form.cost" label="Cost" type="number" step="0.01" prefix="$" />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="form.description" label="Description" rows="3" />
            </VCol>
            <VCol cols="12">
              <VSwitch v-model="form.active" label="Active" />
            </VCol>
          </VRow>
        </VCol>

        <VCol cols="12" md="4">
          <!-- Image placeholder -->
          <VCard variant="outlined" class="text-center pa-6">
            <VIcon icon="tabler-photo" size="64" color="secondary" />
            <p class="text-caption mt-2">Image upload coming soon</p>
          </VCard>
        </VCol>
      </VRow>

      <!-- F&B modifier section -->
      <template v-if="form.type === 'food'">
        <VDivider class="my-6" />
        <p class="text-subtitle-1 font-weight-bold mb-4">Modifier Groups</p>

        <VRow>
          <VCol cols="12" md="6">
            <p class="text-subtitle-2 mb-2">Attached Groups</p>
            <VList density="compact" border rounded>
              <VListItem v-for="g in form.modifier_groups" :key="g.id">
                <VListItemTitle>{{ g.name }}</VListItemTitle>
                <template #append>
                  <VBtn icon size="x-small" variant="text" color="error" @click="detachGroup(g)">
                    <VIcon icon="tabler-x" />
                  </VBtn>
                </template>
              </VListItem>
              <VListItem v-if="!form.modifier_groups.length">
                <VListItemTitle class="text-disabled">No groups attached</VListItemTitle>
              </VListItem>
            </VList>
            <VSelect class="mt-2" :items="availableGroups" label="Attach a group" density="compact"
              clearable @update:modelValue="attachGroup" />
          </VCol>

          <VCol cols="12" md="6">
            <div class="d-flex align-center mb-2">
              <p class="text-subtitle-2 mb-0">Custom Modifiers</p>
              <VSpacer />
              <VBtn size="small" variant="tonal" prepend-icon="tabler-plus" @click="addCustomModifier">Add</VBtn>
            </div>
            <VTable density="compact">
              <tbody>
                <tr v-for="(mod, i) in form.custom_modifiers" :key="i">
                  <td><VTextField v-model="mod.name" density="compact" hide-details placeholder="Name" /></td>
                  <td style="width:120px">
                    <VTextField v-model.number="mod.price_delta" density="compact" hide-details
                      type="number" step="0.01" prefix="$" />
                  </td>
                  <td style="width:40px">
                    <VBtn icon size="x-small" variant="text" color="error" @click="form.custom_modifiers.splice(i, 1)">
                      <VIcon icon="tabler-x" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCol>
        </VRow>
      </template>
    </VCardText>

    <VCardActions class="pa-4">
      <VSpacer />
      <VBtn :to="{ name: 'product' }">Cancel</VBtn>
      <VBtn color="primary" :loading="saving" @click="save">Save</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CatalogService from '@/services/CatalogService'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const allGroups = ref([])
const categoryOptions = ref([{ title: 'No category', value: null }])

const form = ref({
  name: '',
  sku: '',
  type: 'retail',
  category_id: null,
  price: '0',
  cost: null,
  description: '',
  active: true,
  modifier_groups: [],
  custom_modifiers: [],
})

const isNew = computed(() => route.params.id === 'new')

const typeOptions = [
  { title: 'Retail', value: 'retail' },
  { title: 'Food', value: 'food' },
]

const availableGroups = computed(() =>
  allGroups.value
    .filter(g => !form.value.modifier_groups.find(a => a.id === g.id))
    .map(g => ({ title: g.name, value: g.id }))
)

const loadCategories = async () => {
  const res = await CatalogService.listCategories()
  const cats = res?.list ?? res ?? []
  categoryOptions.value = [
    { title: 'No category', value: null },
    ...cats.map(c => ({ title: c.name, value: c.id })),
  ]
}

const loadGroups = async () => {
  const res = await CatalogService.listModifierGroups()
  allGroups.value = res?.list ?? res ?? []
}

const loadProduct = async () => {
  if (isNew.value) return
  loading.value = true
  const product = await CatalogService.getProduct(route.params.id)
  form.value = {
    ...product,
    modifier_groups: product.modifier_groups ?? [],
    custom_modifiers: product.custom_modifiers ?? [],
  }
  loading.value = false
}

const attachGroup = async (groupId) => {
  if (!groupId || isNew.value) {
    if (!isNew.value) return
    const g = allGroups.value.find(g => g.id === groupId)
    if (g) form.value.modifier_groups.push(g)
    return
  }
  await CatalogService.attachModifierGroup(route.params.id, groupId)
  await loadProduct()
}

const detachGroup = async (group) => {
  if (isNew.value) {
    form.value.modifier_groups = form.value.modifier_groups.filter(g => g.id !== group.id)
    return
  }
  await CatalogService.detachModifierGroup(route.params.id, group.id)
  await loadProduct()
}

const addCustomModifier = () => {
  form.value.custom_modifiers.push({ name: '', price_delta: 0 })
}

const save = async () => {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      sku: form.value.sku,
      type: form.value.type,
      category_id: form.value.category_id,
      price: form.value.price,
      cost: form.value.cost,
      description: form.value.description,
      active: form.value.active,
    }

    if (isNew.value) {
      const res = await CatalogService.createProduct(payload)
      const newId = res?.id
      if (newId && form.value.type === 'food') {
        for (const g of form.value.modifier_groups) {
          await CatalogService.attachModifierGroup(newId, g.id)
        }
        for (const mod of form.value.custom_modifiers) {
          await CatalogService.addProductModifier(newId, mod)
        }
      }
    } else {
      await CatalogService.updateProduct({ id: route.params.id, ...payload })
    }

    router.push({ name: 'product' })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadGroups(), loadProduct()])
})
</script>
