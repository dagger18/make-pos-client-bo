<script setup>
import { ref, onMounted } from 'vue'
import { getList as addressTypeList, findByValue as findAddressType } from '@/config/enums/AddressType'
import OrganisationAddressService from '@/services/OrganisationAddressService'

const props = defineProps({
  clientId: { type: Number, default: null },
  providerId: { type: Number, default: null },
})

const addresses = ref([])
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingId = ref(null)
const deleteId = ref(null)
const form = ref({
  addressType: 'REGISTERED', label: null, addressLine1: '', addressLine2: null,
  city: '', state: null, postalCode: null, country: '', isDefault: false, notes: null,
})

async function load() {
  addresses.value = props.clientId
    ? await OrganisationAddressService.listByClient(props.clientId)
    : await OrganisationAddressService.listByProvider(props.providerId)
}

onMounted(load)

function openCreate() {
  editingId.value = null
  form.value = { addressType: 'REGISTERED', label: null, addressLine1: '', addressLine2: null, city: '', state: null, postalCode: null, country: '', isDefault: false, notes: null }
  dialogOpen.value = true
}

function openEdit(addr) {
  editingId.value = addr.id
  form.value = { ...addr }
  dialogOpen.value = true
}

async function save() {
  const payload = { ...form.value, clientId: props.clientId, providerId: props.providerId }
  if (editingId.value) {
    await OrganisationAddressService.update(editingId.value, payload)
  } else {
    await OrganisationAddressService.add(payload)
  }
  dialogOpen.value = false
  await load()
}

function confirmDelete(id) { deleteId.value = id; deleteDialogOpen.value = true }
async function doDelete() {
  await OrganisationAddressService.delete(deleteId.value)
  deleteDialogOpen.value = false
  await load()
}
</script>
<template>
  <div>
    <div class="d-flex justify-end mb-3">
      <VBtn size="small" color="primary" prepend-icon="tabler-plus" @click="openCreate">{{ $gettext('Add Address') }}</VBtn>
    </div>

    <VCard v-for="addr in addresses" :key="addr.id" class="mb-3">
      <VCardText class="d-flex justify-space-between align-start">
        <div>
          <div class="d-flex align-center gap-2 mb-1">
            <VChip size="x-small" color="primary">{{ findAddressType(addr.addressType)?.title ?? addr.addressType }}</VChip>
            <VChip v-if="addr.isDefault" size="x-small" color="success">{{ $gettext('Default') }}</VChip>
            <span v-if="addr.label" class="font-weight-bold">{{ addr.label }}</span>
          </div>
          <div>{{ addr.addressLine1 }}</div>
          <div v-if="addr.addressLine2">{{ addr.addressLine2 }}</div>
          <div>{{ [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ') }} {{ addr.country }}</div>
          <div v-if="addr.notes" class="text-caption text-medium-emphasis mt-1">{{ addr.notes }}</div>
        </div>
        <div>
          <VBtn size="x-small" variant="text" icon="tabler-pencil" @click="openEdit(addr)" />
          <VBtn size="x-small" variant="text" icon="tabler-trash" color="error" @click="confirmDelete(addr.id)" />
        </div>
      </VCardText>
    </VCard>

    <p v-if="!addresses.length" class="text-medium-emphasis text-center py-4">{{ $gettext('No addresses added yet.') }}</p>

    <VDialog v-model="dialogOpen" max-width="600">
      <VCard :title="editingId ? $gettext('Edit Address') : $gettext('Add Address')">
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <VSelect v-model="form.addressType" :label="$gettext('Type')" :items="addressTypeList()" item-value="value" item-title="title" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.label" :label="$gettext('Label (e.g. HCM Warehouse)')" />
            </VCol>
            <VCol cols="12"><VTextField v-model="form.addressLine1" :label="$gettext('Address Line 1')" /></VCol>
            <VCol cols="12"><VTextField v-model="form.addressLine2" :label="$gettext('Address Line 2')" /></VCol>
            <VCol cols="12" md="4"><VTextField v-model="form.city" :label="$gettext('City')" /></VCol>
            <VCol cols="12" md="4"><VTextField v-model="form.state" :label="$gettext('State/Province')" /></VCol>
            <VCol cols="12" md="2"><VTextField v-model="form.postalCode" :label="$gettext('Postal Code')" /></VCol>
            <VCol cols="12" md="2"><VTextField v-model="form.country" :label="$gettext('Country')" maxlength="2" /></VCol>
            <VCol cols="12">
              <VTextarea v-model="form.notes" :label="$gettext('Notes (access instructions, hours...)')" rows="2" />
            </VCol>
            <VCol cols="12">
              <VCheckbox v-model="form.isDefault" :label="$gettext('Set as default')" />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" @click="save">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="deleteDialogOpen" max-width="400">
      <VCard :title="$gettext('Delete Address')">
        <VCardText>{{ $gettext('Are you sure you want to delete this address?') }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteDialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="error" @click="doDelete">{{ $gettext('Delete') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
