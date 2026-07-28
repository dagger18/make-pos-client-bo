<script setup>
import { filterConfigs, headers } from '@/config/tables/WarehouseFacility'
import WarehouseFacilityService from '@/services/WarehouseFacilityService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'Warehouse' } })

const { $gettext } = useGettext()

const table      = ref(null)
const dialogOpen = ref(false)
const saving     = ref(false)
const editingId  = ref(null)
const form       = ref(emptyForm())

function emptyForm() {
  return {
    name: '', locationCode: '', address: '', totalAreaSqm: '', reeferCapacity: '',
    bonded: false, dangerousGoodsApproved: false, contactPhone: '', contactEmail: '', isActive: true,
  }
}

const buttons = computed(() => [{ text: $gettext('New Facility'), func: openCreate }])

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(facility) {
  editingId.value = facility.id
  form.value = {
    name: facility.name ?? '',
    locationCode: facility.locationCode ?? '',
    address: facility.address ?? '',
    totalAreaSqm: facility.totalAreaSqm ?? '',
    reeferCapacity: facility.reeferCapacity ?? '',
    bonded: facility.bonded ?? false,
    dangerousGoodsApproved: facility.dangerousGoodsApproved ?? false,
    contactPhone: facility.contactPhone ?? '',
    contactEmail: facility.contactEmail ?? '',
    isActive: facility.isActive ?? true,
  }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    totalAreaSqm:   form.value.totalAreaSqm   !== '' ? form.value.totalAreaSqm   : null,
    reeferCapacity: form.value.reeferCapacity  !== '' ? Number(form.value.reeferCapacity) : null,
  }
  if (editingId.value) {
    await WarehouseFacilityService.update(editingId.value, payload)
  } else {
    await WarehouseFacilityService.create(payload)
  }
  saving.value = false
  dialogOpen.value = false
  await table.value?.fetchData()
}

async function remove(id) {
  await WarehouseFacilityService.delete(id)
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="WarehouseFacilityService"
    :pageTitle="$gettext('Warehouse Facilities')"
  >
    <template #bonded="{ item }">
      <VIcon v-if="item.bonded" icon="tabler-check" size="16" color="success" />
      <span v-else class="text-disabled">—</span>
    </template>

    <template #dg="{ item }">
      <VIcon v-if="item.dangerousGoodsApproved" icon="tabler-check" size="16" color="warning" />
      <span v-else class="text-disabled">—</span>
    </template>

    <template #isActive="{ item }">
      <VChip :color="item.isActive ? 'success' : 'default'" size="x-small" label>
        {{ item.isActive ? $gettext('Active') : $gettext('Inactive') }}
      </VChip>
    </template>

    <template #action="{ item }">
      <VBtn icon variant="text" size="small" @click="openEdit(item)">
        <VIcon icon="tabler-pencil" size="16" />
      </VBtn>
      <VBtn icon variant="text" size="small" color="error" @click="remove(item.id)">
        <VIcon icon="tabler-trash" size="16" />
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialogOpen" max-width="600">
    <VCard :title="editingId ? $gettext('Edit Facility') : $gettext('New Facility')">
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VTextField v-model="form.name" :label="$gettext('Name')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.locationCode" :label="$gettext('Location Code (UN/LOCODE)')" density="compact" placeholder="VNSGN" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.contactPhone" :label="$gettext('Contact Phone')" density="compact" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.contactEmail" :label="$gettext('Contact Email')" density="compact" />
          </VCol>
          <VCol cols="3">
            <VTextField v-model="form.totalAreaSqm" :label="$gettext('Total Area (m²)')" type="number" density="compact" />
          </VCol>
          <VCol cols="3">
            <VTextField v-model="form.reeferCapacity" :label="$gettext('Reefer Points')" type="number" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="form.address" :label="$gettext('Address')" rows="2" density="compact" />
          </VCol>
          <VCol cols="4">
            <VCheckbox v-model="form.bonded" :label="$gettext('Customs Bonded')" density="compact" hide-details />
          </VCol>
          <VCol cols="4">
            <VCheckbox v-model="form.dangerousGoodsApproved" :label="$gettext('DG Approved')" density="compact" hide-details />
          </VCol>
          <VCol cols="4">
            <VCheckbox v-model="form.isActive" :label="$gettext('Active')" density="compact" hide-details />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
