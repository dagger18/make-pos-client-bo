<script setup>
import { filterConfigs, headers } from '@/config/tables/FreeTimeAgreement'
import DdService from '@/services/DdService'
import ProviderService from '@/services/ProviderService'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'Config', navActiveLink: 'library-charge-type-charge-transport-type' } })
const { $gettext } = useGettext()
const { buttons: headerButtons } = useLibraryHeader()

const table    = ref(null)
const carriers = ref([])
const carrierId = ref(null)
const dialog   = ref(false)
const saving   = ref(false)
const form     = ref(null)

const defaultEntity = () => ({
  id: null,
  carrierId: null,
  portId: null,
  direction: 'IMPORT',
  containerType: null,
  freeType: 'DETENTION',
  freeDays: 7,
  rateTiers: [{ from_day: 1, to_day: null, rate_per_day: 0 }],
  currency: 'USD',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
})

const entity = ref(defaultEntity())
const isEdit = computed(() => !!entity.value.id)

const ftaService = computed(() => ({
  list: (params) => {
    const p = new URLSearchParams(params || '')
    if (carrierId.value) p.set('carrierId', carrierId.value)
    return DdService.list(p.toString())
  },
}))

watch(carrierId, () => table.value?.fetchData())

function openCreate() {
  entity.value = defaultEntity()
  dialog.value = true
}
headerButtons.value = [{ text: $gettext('Add Agreement'), func: openCreate }]
onUnmounted(() => { headerButtons.value = [] })

function openEdit(item) {
  entity.value = {
    id:            item.id,
    carrierId:     item.carrier?.id ?? null,
    portId:        item.port?.id ?? null,
    direction:     item.direction,
    containerType: item.containerType,
    freeType:      item.freeType,
    freeDays:      item.freeDays,
    rateTiers:     JSON.parse(JSON.stringify(item.rateTiers)),
    currency:      item.currency,
    effectiveFrom: item.effectiveFrom,
    effectiveTo:   item.effectiveTo,
  }
  dialog.value = true
}

function addTier() {
  const last = entity.value.rateTiers.at(-1)
  const nextFrom = last ? (last.to_day ? last.to_day + 1 : (last.from_day ?? 1) + 1) : 1
  entity.value.rateTiers.push({ from_day: nextFrom, to_day: null, rate_per_day: 0 })
}

function removeTier(idx) {
  entity.value.rateTiers.splice(idx, 1)
}

async function save() {
  const { valid } = await form.value.validate()
  if (!valid) return
  saving.value = true
  try {
    if (isEdit.value) {
      await DdService.updateFta(entity.value.id, entity.value)
    } else {
      await DdService.createFta(entity.value)
    }
    dialog.value = false
    await table.value?.fetchData()
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  if (!confirm(`${$gettext('Delete agreement for')} ${item.carrier?.name}?`)) return
  await DdService.deleteFta(item.id)
  await table.value?.fetchData()
}

async function loadCarriers() {
  const res = await ProviderService.list('providerType=carrier&limit=-1')
  carriers.value = Array.isArray(res) ? res : (res?.list ?? res?.data ?? [])
}

onMounted(loadCarriers)
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="ftaService"
    :hideTitle="true"
  >
    <template #tableAction>
      <VSelect
        v-model="carrierId"
        :items="carriers"
        item-title="name"
        item-value="id"
        :label="$gettext('Filter by Carrier')"
        density="compact"
        hide-details
        clearable
        style="max-width: 240px"
      />
    </template>

    <template #action="{ item }">
      <VBtn icon variant="text" size="x-small" @click="openEdit(item)">
        <VIcon icon="tabler-pencil" size="18" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" color="error" @click="remove(item)">
        <VIcon icon="tabler-trash" size="18" />
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="800px">
    <VCard>
      <VCardTitle class="pa-4 text-subtitle-1 font-weight-semibold">
        {{ isEdit ? $gettext('Edit Free Time Agreement') : $gettext('New Free Time Agreement') }}
      </VCardTitle>
      <VDivider />
      <VCardText>
        <VForm ref="form">
          <VRow>
            <VCol cols="12" sm="6">
              <VAutocomplete
                v-model="entity.carrierId"
                :items="carriers"
                item-title="name"
                item-value="id"
                :label="$gettext('Carrier')"
                :rules="[v => !!v || $gettext('Carrier is required')]"
                density="compact"
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField v-model="entity.portId" :label="$gettext('Port ID (optional)')" density="compact" type="number" clearable />
            </VCol>
            <VCol cols="12" sm="4">
              <VSelect v-model="entity.direction" :items="['IMPORT', 'EXPORT']" :label="$gettext('Direction')" density="compact" />
            </VCol>
            <VCol cols="12" sm="4">
              <VSelect v-model="entity.freeType" :items="['DETENTION', 'DEMURRAGE', 'COMBINED']" :label="$gettext('Free Type')" density="compact" />
            </VCol>
            <VCol cols="12" sm="4">
              <VSelect
                v-model="entity.containerType"
                :items="[{title: $gettext('Any'), value: null}, '20DC', '40DC', '40HC', '20RF', '40RF', '20OT', '40OT']"
                :label="$gettext('Container Type')"
                density="compact"
                clearable
              />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model.number="entity.freeDays" :label="$gettext('Free Days')" density="compact" type="number" :rules="[v => v >= 0 || $gettext('Required')]" />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model="entity.currency" :label="$gettext('Currency')" density="compact" :rules="[v => !!v || $gettext('Required')]" />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model="entity.effectiveFrom" :label="$gettext('Effective From')" density="compact" type="date" :rules="[v => !!v || $gettext('Required')]" />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField v-model="entity.effectiveTo" :label="$gettext('Effective To')" density="compact" type="date" clearable />
            </VCol>
          </VRow>

          <VDivider class="my-3" />
          <div class="d-flex align-center mb-2">
            <span class="text-subtitle-2 font-weight-semibold">{{ $gettext('Rate Tiers') }}</span>
            <VSpacer />
            <VBtn size="x-small" prepend-icon="tabler-plus" variant="tonal" @click="addTier">{{ $gettext('Add Tier') }}</VBtn>
          </div>

          <VTable density="compact">
            <thead>
              <tr>
                <th>{{ $gettext('From Day') }}</th>
                <th>{{ $gettext('To Day') }}</th>
                <th>{{ $gettext('Rate / Day') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tier, idx) in entity.rateTiers" :key="idx">
                <td style="width: 120px">
                  <VTextField v-model.number="tier.from_day" density="compact" type="number" hide-details />
                </td>
                <td style="width: 120px">
                  <VTextField v-model.number="tier.to_day" density="compact" type="number" hide-details :placeholder="$gettext('open')" clearable />
                </td>
                <td>
                  <VTextField v-model.number="tier.rate_per_day" density="compact" type="number" hide-details />
                </td>
                <td style="width: 40px">
                  <VBtn icon variant="text" size="x-small" color="error" @click="removeTier(idx)" :disabled="entity.rateTiers.length === 1">
                    <VIcon icon="tabler-trash" size="16" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VForm>
      </VCardText>
      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
