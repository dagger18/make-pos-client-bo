<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Modifier Groups</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="openGroupDialog()">Add Group</VBtn>
    </VCardTitle>
    <VCardText>
      <VExpansionPanels variant="accordion">
        <VExpansionPanel v-for="group in groups" :key="group.id">
          <VExpansionPanelTitle>
            <div class="d-flex align-center gap-3 w-100">
              <span class="font-weight-medium">{{ group.name }}</span>
              <VChip size="x-small" :color="group.required ? 'error' : 'default'">
                {{ group.required ? 'Required' : 'Optional' }}
              </VChip>
              <VChip size="x-small">min {{ group.min }} / max {{ group.max ?? '∞' }}</VChip>
              <VSpacer />
              <VBtn icon size="x-small" variant="text" @click.stop="openGroupDialog(group)">
                <VIcon icon="tabler-edit" />
              </VBtn>
              <VBtn icon size="x-small" variant="text" color="error" @click.stop="deleteGroup(group)">
                <VIcon icon="tabler-trash" />
              </VBtn>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VTable density="compact">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price Delta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mod in group.modifiers" :key="mod.id">
                  <td>{{ mod.name }}</td>
                  <td>{{ mod.price_delta >= 0 ? '+' : '' }}{{ mod.price_delta }}</td>
                  <td class="text-right">
                    <VBtn icon size="x-small" variant="text" @click="openModDialog(group, mod)">
                      <VIcon icon="tabler-edit" />
                    </VBtn>
                    <VBtn icon size="x-small" variant="text" color="error" @click="deleteMod(group, mod)">
                      <VIcon icon="tabler-trash" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VBtn class="mt-2" size="small" variant="tonal" prepend-icon="tabler-plus"
              @click="openModDialog(group)">Add Modifier</VBtn>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
  </VCard>

  <!-- Group Dialog -->
  <VDialog v-model="groupDialog" max-width="440">
    <VCard>
      <VCardTitle>{{ editGroup?.id ? 'Edit' : 'Add' }} Modifier Group</VCardTitle>
      <VCardText>
        <VTextField v-model="groupForm.name" label="Name" class="mb-3" />
        <VSwitch v-model="groupForm.required" label="Required" class="mb-3" />
        <VRow>
          <VCol><VTextField v-model.number="groupForm.min" label="Min selections" type="number" /></VCol>
          <VCol><VTextField v-model="groupForm.max" label="Max selections (blank = unlimited)" type="number" /></VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="groupDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="saveGroup">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Modifier Dialog -->
  <VDialog v-model="modDialog" max-width="380">
    <VCard>
      <VCardTitle>{{ editMod?.id ? 'Edit' : 'Add' }} Modifier</VCardTitle>
      <VCardText>
        <VTextField v-model="modForm.name" label="Name" class="mb-3" />
        <VTextField v-model.number="modForm.price_delta" label="Price Delta (e.g. 1.50 or -0.50)" type="number" step="0.01" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="modDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="saveMod">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CatalogService from '@/services/CatalogService'

const groups = ref([])
const groupDialog = ref(false)
const modDialog = ref(false)
const editGroup = ref(null)
const editMod = ref(null)
const activeGroup = ref(null)
const groupForm = ref({ name: '', required: false, min: 0, max: null })
const modForm = ref({ name: '', price_delta: 0 })

const load = async () => {
  const res = await CatalogService.listModifierGroups()
  groups.value = res?.list ?? res ?? []
}

const openGroupDialog = (group = null) => {
  editGroup.value = group
  groupForm.value = group
    ? { name: group.name, required: group.required, min: group.min, max: group.max }
    : { name: '', required: false, min: 0, max: null }
  groupDialog.value = true
}

const saveGroup = async () => {
  if (editGroup.value?.id) {
    await CatalogService.updateModifierGroup({ id: editGroup.value.id, ...groupForm.value })
  } else {
    await CatalogService.createModifierGroup(groupForm.value)
  }
  groupDialog.value = false
  await load()
}

const deleteGroup = async (group) => {
  if (!confirm(`Delete group "${group.name}" and all its modifiers?`)) return
  await CatalogService.deleteModifierGroup(group.id)
  await load()
}

const openModDialog = (group, mod = null) => {
  activeGroup.value = group
  editMod.value = mod
  modForm.value = mod ? { name: mod.name, price_delta: mod.price_delta } : { name: '', price_delta: 0 }
  modDialog.value = true
}

const saveMod = async () => {
  if (editMod.value?.id) {
    await CatalogService.updateModifier(activeGroup.value.id, editMod.value.id, modForm.value)
  } else {
    await CatalogService.addModifier(activeGroup.value.id, modForm.value)
  }
  modDialog.value = false
  await load()
}

const deleteMod = async (group, mod) => {
  if (!confirm(`Delete modifier "${mod.name}"?`)) return
  await CatalogService.deleteModifier(group.id, mod.id)
  await load()
}

onMounted(load)
</script>
