<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus'
import ClientService from '@/services/ClientService'
import ShipmentPartyService from '@/services/ShipmentPartyService'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const editable = computed(() =>
  props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
)

const allRoles = [
  { value: 'SHIPPER',        label: 'Shipper',                color: 'primary' },
  { value: 'CONSIGNEE',      label: 'Consignee',              color: 'secondary' },
  { value: 'NOTIFY_1',       label: 'Notify Party 1',         color: 'info' },
  { value: 'NOTIFY_2',       label: 'Notify Party 2',         color: 'info' },
  { value: 'OVERSEAS_AGENT', label: 'Overseas Agent',         color: 'warning' },
  { value: 'CARRIER',        label: 'Carrier',                color: 'deep-purple' },
  { value: 'CO_LOADER',      label: 'Co-Loader',              color: 'indigo' },
  { value: 'CUSTOMS_BROKER', label: 'Customs Broker',         color: 'teal' },
  { value: 'HAULIER_O',      label: 'Haulier (Origin)',       color: 'brown' },
  { value: 'HAULIER_D',      label: 'Haulier (Destination)',  color: 'brown' },
  { value: 'WAREHOUSE_O',    label: 'Warehouse (Origin)',     color: 'blue-grey' },
  { value: 'WAREHOUSE_D',    label: 'Warehouse (Destination)', color: 'blue-grey' },
  { value: 'INSURANCE',      label: 'Insurer',                color: 'green' },
  { value: 'SURVEYOR',       label: 'Surveyor',               color: 'lime' },
  { value: 'BANK',           label: 'Bank',                   color: 'amber' },
  { value: 'FUMIGATION',     label: 'Fumigation',             color: 'orange' },
]

function roleConfig(roleValue) {
  return allRoles.find(r => r.value === roleValue) ?? { label: roleValue, color: 'default' }
}

const parties = ref([])

async function load() {
  parties.value = await ShipmentPartyService.list(props.shipment.id) ?? []
}

const assignedRoles = computed(() => new Set(parties.value.map(p => p.role)))
const availableRoles = computed(() => allRoles.filter(r => !assignedRoles.value.has(r.value)))

// ─── Client autocomplete ─────────────────────────────────────────────────────
const clientItems = ref([])
const clientSearch = ref('')
let clientSearchTimer = null

async function onClientSearch(val) {
  clearTimeout(clientSearchTimer)
  clientSearchTimer = setTimeout(async () => {
    const res = await ClientService.list(val ? `name=${encodeURIComponent(val)}` : '')
    clientItems.value = res?.data ?? res ?? []
  }, 250)
}

const contactItems = computed(() => {
  if (!form.value.clientId) return []
  const client = clientItems.value.find(c => c.id === form.value.clientId)
  return client?.contacts ?? []
})

// ─── Add / Edit dialog ───────────────────────────────────────────────────────
const dialogOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const emptyForm = () => ({
  role: '',
  clientId: null,
  contactId: null,
  reference: '',
  isAlsoNotify: false,
  addressSnapshot: null,
})

const form = ref(emptyForm())

const addressPreview = computed(() => {
  const snap = form.value.addressSnapshot
  if (!snap) return null
  return [snap.name, snap.address, snap.city, snap.country].filter(Boolean).join(', ')
})

function openAdd() {
  isEditing.value = false
  form.value = emptyForm()
  clientItems.value = []
  dialogOpen.value = true
}

function openEdit(party) {
  isEditing.value = true
  form.value = {
    role: party.role,
    clientId: party.client?.id ?? null,
    contactId: party.contact?.id ?? null,
    reference: party.reference ?? '',
    isAlsoNotify: party.isAlsoNotify,
    addressSnapshot: party.addressSnapshot,
  }
  if (party.client) {
    clientItems.value = [party.client]
  }
  dialogOpen.value = true
}

async function onClientSelected(clientId) {
  form.value.contactId = null
  form.value.addressSnapshot = null
  if (!clientId) return
  const client = clientItems.value.find(c => c.id === clientId)
    ?? await ClientService.get(clientId)
  if (client) {
    if (!clientItems.value.find(c => c.id === client.id)) {
      clientItems.value = [...clientItems.value, client]
    }
    form.value.addressSnapshot = {
      name:    client.name,
      address: client.address ?? '',
      city:    client.city ?? '',
      country: client.country ?? '',
      phone:   client.phone ?? '',
      email:   client.defaultContact?.email ?? '',
      taxId:   '',
    }
  }
}

async function save() {
  saving.value = true
  const payload = {
    clientId:       form.value.clientId,
    contactId:      form.value.contactId,
    reference:      form.value.reference || null,
    isAlsoNotify:   form.value.isAlsoNotify,
  }

  if (isEditing.value) {
    await ShipmentPartyService.update(props.shipment.id, form.value.role, payload)
  } else {
    await ShipmentPartyService.create(props.shipment.id, { role: form.value.role, ...payload })
  }
  dialogOpen.value = false
  saving.value = false
  await load()
}

async function removeParty(party) {
  const ok = await useAppStore().confirm.open(
    $gettext('Remove Party'),
    $gettext('Remove %{role} from this shipment?', { role: roleConfig(party.role).label }),
    { color: 'warning' }
  )
  if (!ok) return
  await ShipmentPartyService.delete(props.shipment.id, party.role)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3">
      <span class="text-subtitle-1 font-weight-medium">{{ $gettext('Parties') }}</span>
      <VChip v-if="parties.length" size="x-small" class="ms-2">{{ parties.length }}</VChip>
      <VSpacer />
      <VBtn v-if="editable" size="small" @click="openAdd" :disabled="availableRoles.length === 0">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Party') }}
      </VBtn>
    </div>

    <div v-if="parties.length === 0" class="text-caption text-disabled py-4 text-center">
      {{ $gettext('No parties assigned. Add a shipper, consignee, and other relevant parties.') }}
    </div>

    <VRow dense>
      <VCol
        v-for="party in parties"
        :key="party.role"
        cols="12"
        md="6"
      >
        <VCard variant="outlined" class="h-100">
          <VCardText class="pa-3">
            <div class="d-flex align-start mb-2">
              <VChip
                :color="roleConfig(party.role).color"
                size="x-small"
                label
                class="me-2 mt-1 flex-shrink-0"
              >
                {{ roleConfig(party.role).label }}
              </VChip>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">
                  {{ party.addressSnapshot?.name ?? party.client?.name ?? '—' }}
                </div>
                <div v-if="party.addressSnapshot?.address" class="text-caption text-medium-emphasis">
                  {{ party.addressSnapshot.address }}
                </div>
                <div
                  v-if="party.addressSnapshot?.city || party.addressSnapshot?.country"
                  class="text-caption text-medium-emphasis"
                >
                  {{ [party.addressSnapshot.city, party.addressSnapshot.country].filter(Boolean).join(', ') }}
                </div>
              </div>
              <div v-if="editable" class="d-flex gap-1 ms-1">
                <VBtn icon size="x-small" variant="plain" @click="openEdit(party)">
                  <VIcon icon="tabler-pencil" size="14" />
                </VBtn>
                <VBtn icon size="x-small" variant="plain" color="error" @click="removeParty(party)">
                  <VIcon icon="tabler-trash" size="14" />
                </VBtn>
              </div>
            </div>

            <VDivider class="mb-2" />

            <div class="d-flex flex-wrap gap-x-4 text-caption text-medium-emphasis">
              <span v-if="party.contact?.name">
                <VIcon icon="tabler-user" size="12" class="me-1" />{{ party.contact.name }}
              </span>
              <span v-if="party.contact?.email">
                <VIcon icon="tabler-mail" size="12" class="me-1" />{{ party.contact.email }}
              </span>
              <span v-if="party.reference">
                <VIcon icon="tabler-hash" size="12" class="me-1" />{{ party.reference }}
              </span>
              <VChip v-if="party.isAlsoNotify" size="x-small" color="teal" class="ms-auto">
                {{ $gettext('Also Notify') }}
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Add / Edit dialog -->
    <VDialog v-model="dialogOpen" max-width="560" scrollable>
      <VCard :title="isEditing ? $gettext('Edit Party') : $gettext('Add Party')">
        <VCardText>
          <VSelect
            v-if="!isEditing"
            v-model="form.role"
            :items="availableRoles"
            item-title="label"
            item-value="value"
            :label="$gettext('Role')"
            density="compact"
            class="mb-3"
          />
          <VChip v-else :color="roleConfig(form.role).color" label class="mb-4">
            {{ roleConfig(form.role).label }}
          </VChip>

          <VAutocomplete
            v-model="form.clientId"
            v-model:search="clientSearch"
            :items="clientItems"
            item-title="name"
            item-value="id"
            :label="$gettext('Organisation')"
            density="compact"
            clearable
            no-filter
            class="mb-3"
            @update:search="onClientSearch"
            @update:model-value="onClientSelected"
          />

          <div v-if="addressPreview" class="text-caption text-medium-emphasis bg-grey-lighten-4 rounded pa-2 mb-3">
            <VIcon icon="tabler-map-pin" size="13" class="me-1" />{{ addressPreview }}
          </div>

          <VSelect
            v-model="form.contactId"
            :items="contactItems"
            :item-title="ct => `${ct.firstName ?? ''} ${ct.lastName ?? ''}`.trim()"
            item-value="id"
            :label="$gettext('Contact person')"
            density="compact"
            clearable
            :disabled="!form.clientId"
            class="mb-3"
          />

          <VTextField
            v-model="form.reference"
            :label="$gettext('Party reference / job number')"
            density="compact"
            class="mb-3"
          />

          <VCheckbox
            v-model="form.isAlsoNotify"
            :label="$gettext('Also use as Notify Party')"
            density="compact"
            hide-details
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="saving"
            :disabled="!isEditing && !form.role"
            @click="save"
          >
            {{ $gettext('Save') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
