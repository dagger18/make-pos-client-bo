<script setup>
import { allPageTypes, getTitle } from '@/config/enums/PageType'
import { filterConfigs, headers } from '@/config/tables/SettingPage'
import PageService from '@/services/PageService'
import PageView from '@/views/report/PageView.vue'
import { useGettext } from 'vue3-gettext'

definePage({
  meta: { action: 'GET', subject: 'Config' },
})

const { $gettext } = useGettext()

const table      = ref(null)
const pages      = ref([])
const filterType = ref(null)
const dialogOpen = ref(false)
const saving     = ref(false)
const editingId  = ref(null)
const componentsDialogOpen = ref(false)
const selectedPage = ref(null)
const pageViewRef  = ref(null)

const form = ref({ name: '', type: 'report-shipment' })

const typeGroups = computed(() => {
  const groups = { report: [], manage: [] }
  allPageTypes.forEach(t => { groups[t.group]?.push(t) })
  return groups
})

const pageCountByType = computed(() => {
  const map = {}
  pages.value.forEach(p => { map[p.type] = (map[p.type] ?? 0) + 1 })
  return map
})

const pageService = computed(() => ({
  list: async (params) => {
    const p = new URLSearchParams(params || '')
    p.set('limit', '-1')
    p.set('sort_asc', 'orderNumber')
    if (filterType.value) p.set('type', filterType.value)
    const res = await PageService.list(p.toString())
    pages.value = res?.list ?? []
    return res
  },
}))

watch(filterType, () => table.value?.fetchData())

const buttons = computed(() => [{ text: $gettext('New Page'), func: openCreate }])

function openCreate() {
  editingId.value = null
  form.value = { name: '', type: filterType.value ?? 'report-shipment' }
  dialogOpen.value = true
}

function openEdit(page) {
  editingId.value = page.id
  form.value = { name: page.name, type: page.type }
  dialogOpen.value = true
}

async function save() {
  if (!form.value.name.trim()) return
  saving.value = true
  if (editingId.value) {
    await PageService.update({ id: editingId.value, ...form.value })
  } else {
    await PageService.add(form.value)
  }
  saving.value = false
  dialogOpen.value = false
  await table.value?.fetchData()
}

async function remove(page) {
  await PageService.delete(page.id)
  await table.value?.fetchData()
}

async function moveUp(page) {
  const sameType = pages.value.filter(p => p.type === page.type)
  const idx = sameType.findIndex(p => p.id === page.id)
  if (idx <= 0) return
  await PageService.reOrder({ pages: [sameType[idx].id, sameType[idx - 1].id] })
  await table.value?.fetchData()
}

async function moveDown(page) {
  const sameType = pages.value.filter(p => p.type === page.type)
  const idx = sameType.findIndex(p => p.id === page.id)
  if (idx >= sameType.length - 1) return
  await PageService.reOrder({ pages: [sameType[idx + 1].id, sameType[idx].id] })
  await table.value?.fetchData()
}

function openComponents(page) {
  selectedPage.value = page
  componentsDialogOpen.value = true
}

function addComponent() {
  pageViewRef.value?.setEntity()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="pageService"
    :pageTitle="$gettext('Pages')"
    :buttons="buttons"
  >
    <template #beforeTable>
      <div class="d-flex flex-wrap gap-2 px-4 pb-2">
        <VChip
          :color="filterType === null ? 'primary' : 'default'"
          :variant="filterType === null ? 'flat' : 'tonal'"
          size="small" label class="cursor-pointer"
          @click="filterType = null"
        >
          {{ $gettext('All') }} ({{ pages.length }})
        </VChip>

        <span class="text-caption text-disabled d-flex align-center me-1">{{ $gettext('Reports') }}:</span>
        <VChip
          v-for="t in typeGroups.report" :key="t.value"
          :color="filterType === t.value ? 'primary' : 'default'"
          :variant="filterType === t.value ? 'flat' : 'tonal'"
          size="small" label class="cursor-pointer"
          @click="filterType = filterType === t.value ? null : t.value"
        >
          {{ t.title }} ({{ pageCountByType[t.value] ?? 0 }})
        </VChip>

        <span class="text-caption text-disabled d-flex align-center me-1 ms-2">{{ $gettext('Manage') }}:</span>
        <VChip
          v-for="t in typeGroups.manage" :key="t.value"
          :color="filterType === t.value ? 'primary' : 'default'"
          :variant="filterType === t.value ? 'flat' : 'tonal'"
          size="small" label class="cursor-pointer"
          @click="filterType = filterType === t.value ? null : t.value"
        >
          {{ t.title }} ({{ pageCountByType[t.value] ?? 0 }})
        </VChip>
      </div>
    </template>

    <template #type="{ item }">
      <VChip :color="item.type.startsWith('report') ? 'info' : 'secondary'" size="x-small" label>
        {{ getTitle(item.type) }}
      </VChip>
    </template>

    <template #action="{ item }">
      <VBtn icon variant="text" size="x-small" :title="$gettext('Move Up')" @click="moveUp(item)">
        <VIcon icon="tabler-chevron-up" size="14" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" :title="$gettext('Move Down')" @click="moveDown(item)">
        <VIcon icon="tabler-chevron-down" size="14" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" :title="$gettext('Components')" @click="openComponents(item)">
        <VIcon icon="tabler-layout-board" size="14" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" :title="$gettext('Rename')" @click="openEdit(item)">
        <VIcon icon="tabler-pencil" size="14" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" color="error" :title="$gettext('Delete')" @click="remove(item)">
        <VIcon icon="tabler-trash" size="14" />
      </VBtn>
    </template>
  </AppTable>

  <!-- Create / Rename dialog -->
  <VDialog v-model="dialogOpen" max-width="480">
    <VCard :title="editingId ? $gettext('Rename Page') : $gettext('New Page')">
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              :label="$gettext('Page Name')"
              density="compact"
              autofocus
              @keyup.enter="save"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="form.type"
              :items="allPageTypes"
              item-title="title"
              item-value="value"
              :label="$gettext('Page Type')"
              density="compact"
              :disabled="!!editingId"
            >
              <template #item="{ props: itemProps, item }">
                <VListItem v-bind="itemProps">
                  <template #append>
                    <VChip
                      :color="item.raw.group === 'report' ? 'info' : 'secondary'"
                      size="x-small" label class="ms-2"
                    >
                      {{ item.raw.group }}
                    </VChip>
                  </template>
                </VListItem>
              </template>
            </VSelect>
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" :disabled="!form.name.trim()" @click="save">
          {{ $gettext('Save') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Component editor dialog -->
  <VDialog v-model="componentsDialogOpen" max-width="1400" scrollable>
    <VCard v-if="selectedPage">
      <VCardTitle class="d-flex align-center px-4 pt-4 pb-2">
        <VIcon icon="tabler-layout-board" size="20" class="me-2" />
        {{ selectedPage.name }}
        <VChip
          :color="selectedPage.type.startsWith('report') ? 'info' : 'secondary'"
          size="small" label class="ms-2"
        >
          {{ getTitle(selectedPage.type) }}
        </VChip>
        <VSpacer />
        <VBtn size="small" variant="tonal" color="primary" class="me-2" @click="addComponent">
          <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Component') }}
        </VBtn>
        <VBtn icon variant="text" @click="componentsDialogOpen = false">
          <VIcon icon="tabler-x" size="20" />
        </VBtn>
      </VCardTitle>
      <VCardText>
        <PageView :page="selectedPage" ref="pageViewRef" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
