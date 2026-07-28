<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Product Categories</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="openParentDialog()">Add Category</VBtn>
    </VCardTitle>

    <VCardText>
      <VRow>
        <!-- Parent categories -->
        <VCol cols="12" md="5">
          <p class="text-subtitle-2 mb-2">Categories</p>
          <VList density="compact" border rounded>
            <VListItem
              v-for="cat in parents"
              :key="cat.id"
              :active="selectedParent?.id === cat.id"
              @click="selectedParent = cat"
            >
              <VListItemTitle>{{ cat.name }}</VListItemTitle>
              <template #append>
                <VBtn icon size="x-small" variant="text" @click.stop="openParentDialog(cat)">
                  <VIcon icon="tabler-edit" />
                </VBtn>
                <VBtn icon size="x-small" variant="text" color="error" @click.stop="deleteCategory(cat)">
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </template>
            </VListItem>
            <VListItem v-if="!parents.length">
              <VListItemTitle class="text-disabled">No categories yet</VListItemTitle>
            </VListItem>
          </VList>
        </VCol>

        <!-- Subcategories -->
        <VCol cols="12" md="7">
          <div class="d-flex align-center mb-2">
            <p class="text-subtitle-2 mb-0">
              Subcategories{{ selectedParent ? ` of "${selectedParent.name}"` : '' }}
            </p>
            <VSpacer />
            <VBtn v-if="selectedParent" size="small" variant="tonal" prepend-icon="tabler-plus"
              @click="openChildDialog()">Add Subcategory</VBtn>
          </div>
          <VList v-if="selectedParent" density="compact" border rounded>
            <VListItem v-for="sub in children" :key="sub.id">
              <VListItemTitle>{{ sub.name }}</VListItemTitle>
              <template #append>
                <VBtn icon size="x-small" variant="text" @click.stop="openChildDialog(sub)">
                  <VIcon icon="tabler-edit" />
                </VBtn>
                <VBtn icon size="x-small" variant="text" color="error" @click.stop="deleteCategory(sub)">
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </template>
            </VListItem>
            <VListItem v-if="selectedParent && !children.length">
              <VListItemTitle class="text-disabled">No subcategories yet</VListItemTitle>
            </VListItem>
          </VList>
          <p v-else class="text-disabled text-caption">Select a category on the left to see subcategories.</p>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <!-- Create/Edit Dialog -->
  <VDialog v-model="dialog" max-width="400">
    <VCard>
      <VCardTitle>{{ editTarget?.id ? 'Edit' : 'Add' }} {{ dialogMode === 'parent' ? 'Category' : 'Subcategory' }}</VCardTitle>
      <VCardText>
        <VTextField v-model="form.name" label="Name" autofocus />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="dialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="saveCategory">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CatalogService from '@/services/CatalogService'

const allCategories = ref([])
const selectedParent = ref(null)
const dialog = ref(false)
const dialogMode = ref('parent')
const editTarget = ref(null)
const form = ref({ name: '' })

const parents = computed(() => allCategories.value.filter(c => !c.parent_id))
const children = computed(() =>
  selectedParent.value
    ? allCategories.value.filter(c => c.parent_id === selectedParent.value.id)
    : []
)

const load = async () => {
  const res = await CatalogService.listCategories()
  allCategories.value = res?.list ?? res ?? []
}

const openParentDialog = (cat = null) => {
  dialogMode.value = 'parent'
  editTarget.value = cat
  form.value.name = cat?.name ?? ''
  dialog.value = true
}

const openChildDialog = (cat = null) => {
  dialogMode.value = 'child'
  editTarget.value = cat
  form.value.name = cat?.name ?? ''
  dialog.value = true
}

const saveCategory = async () => {
  const payload = {
    name: form.value.name,
    parent_id: dialogMode.value === 'child' ? selectedParent.value?.id : null,
  }
  if (editTarget.value?.id) {
    await CatalogService.updateCategory({ id: editTarget.value.id, ...payload })
  } else {
    await CatalogService.createCategory(payload)
  }
  dialog.value = false
  await load()
}

const deleteCategory = async (cat) => {
  if (!confirm(`Delete "${cat.name}"?`)) return
  await CatalogService.deleteCategory(cat.id)
  if (selectedParent.value?.id === cat.id) selectedParent.value = null
  await load()
}

onMounted(load)
</script>