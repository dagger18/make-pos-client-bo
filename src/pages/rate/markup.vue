<script setup>
import { filterConfigs, headers } from '@/config/tables/PriceMarkup'
import PriceMarkupService from '@/services/PriceMarkupService'
import { getList as chargeTypeList } from '@/config/enums/ChargeType'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'PriceMarkup' } })

const { $gettext } = useGettext()

const table   = ref(null)
const dialog  = ref(false)
const saving  = ref(false)
const editId  = ref(null)

const RULE_TYPES = [
  { value: 'PERCENTAGE', title: $gettext('Percentage (%)') },
  { value: 'FLAT',       title: $gettext('Flat Amount') },
  { value: 'MIN_MARGIN', title: $gettext('Minimum Margin') },
]

const CHARGE_CATS = [
  { value: null, title: $gettext('All Categories') },
  ...chargeTypeList.map(c => ({ value: c.value, title: c.shortTitle ?? c.title })),
]

function emptyRule() {
  return { ruleType: 'PERCENTAGE', chargeCategory: null, chargeCode: '', value: 0, currency: '' }
}
function emptyForm() {
  return { name: '', rules: [emptyRule()] }
}

const form    = ref(emptyForm())
const isEdit  = computed(() => !!editId.value)

const ruleTypeColor = { PERCENTAGE: 'primary', FLAT: 'secondary', MIN_MARGIN: 'warning' }

function ruleLabel(rule) {
  const cat = CHARGE_CATS.find(c => c.value === rule.chargeCategory)?.title ?? $gettext('All')
  if (rule.ruleType === 'PERCENTAGE') return `+${rule.value}% (${cat})`
  const curr = rule.currency || 'USD'
  if (rule.ruleType === 'FLAT') {
    const scope = rule.chargeCode ? rule.chargeCode : cat
    return `+${curr} ${rule.value} (${scope})`
  }
  return `≥ ${curr} ${rule.value}`
}

const buttons = computed(() => [{ text: $gettext('New Tier'), func: openCreate }])

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  dialog.value = true
}

function openEdit(item) {
  editId.value = item.id
  form.value = {
    name: item.name,
    rules: item.rules?.length ? JSON.parse(JSON.stringify(item.rules)) : [emptyRule()],
  }
  dialog.value = true
}

function addRule()         { form.value.rules.push(emptyRule()) }
function removeRule(idx)   { if (form.value.rules.length > 1) form.value.rules.splice(idx, 1) }

async function save() {
  if (!form.value.name.trim()) return
  saving.value = true
  const payload = {
    name: form.value.name.trim(),
    rules: form.value.rules.map(r => ({
      ruleType:       r.ruleType,
      chargeCategory: r.chargeCategory || null,
      chargeCode:     r.chargeCode?.trim() || null,
      value:          parseFloat(r.value) || 0,
      currency:       (r.ruleType !== 'PERCENTAGE' && r.currency?.trim()) ? r.currency.trim().toUpperCase() : null,
    })),
  }
  if (isEdit.value) {
    await PriceMarkupService.update({ id: editId.value, ...payload })
  } else {
    await PriceMarkupService.add(payload)
  }
  dialog.value = false
  saving.value = false
  await table.value?.fetchData()
}

async function remove(item) {
  if (!confirm(`${$gettext('Delete')} "${item.name}"?`)) return
  await PriceMarkupService.delete(item.id)
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="filterConfigs"
    :apiService="PriceMarkupService"
    :pageTitle="$gettext('Price Markup Rules')"
  >
    <template #rules="{ item }">
      <VChip size="x-small" label color="default">{{ item.rules?.length ?? 0 }}</VChip>
    </template>

    <template #action="{ item }">
      <VBtn icon variant="text" size="x-small" @click="openEdit(item)">
        <VIcon icon="tabler-pencil" size="14" />
      </VBtn>
      <VBtn icon variant="text" size="x-small" color="error" @click="remove(item)">
        <VIcon icon="tabler-trash" size="14" />
      </VBtn>
    </template>
  </AppTable>

  <VDialog v-model="dialog" max-width="760" scrollable>
    <VCard :title="isEdit ? $gettext('Edit Pricing Tier') : $gettext('New Pricing Tier')">
      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              :label="$gettext('Tier Name')"
              density="compact"
              placeholder="Gold, Silver, Standard…"
              autofocus
            />
          </VCol>
        </VRow>

        <div class="d-flex align-center mt-4 mb-2">
          <span class="text-subtitle-2 font-weight-semibold">{{ $gettext('Markup Rules') }}</span>
          <VSpacer />
          <VBtn size="x-small" variant="tonal" color="primary" prepend-icon="tabler-plus" @click="addRule">
            {{ $gettext('Add Rule') }}
          </VBtn>
        </div>

        <VTable density="compact" class="markup-rules-table">
          <thead>
            <tr>
              <th style="width:160px">{{ $gettext('Type') }}</th>
              <th style="width:140px">{{ $gettext('Charge Category') }}</th>
              <th style="width:110px">{{ $gettext('Charge Code') }}</th>
              <th style="width:100px">{{ $gettext('Value') }}</th>
              <th style="width:80px">{{ $gettext('Currency') }}</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, idx) in form.rules" :key="idx">
              <td>
                <VSelect v-model="rule.ruleType" :items="RULE_TYPES" item-title="title" item-value="value" density="compact" hide-details variant="plain" />
              </td>
              <td>
                <VSelect v-model="rule.chargeCategory" :items="CHARGE_CATS" item-title="title" item-value="value" density="compact" hide-details variant="plain" />
              </td>
              <td>
                <VTextField v-model="rule.chargeCode" density="compact" hide-details variant="plain" placeholder="THC, BAF…" :disabled="rule.ruleType === 'MIN_MARGIN'" />
              </td>
              <td>
                <VTextField v-model.number="rule.value" type="number" density="compact" hide-details variant="plain" :suffix="rule.ruleType === 'PERCENTAGE' ? '%' : ''" />
              </td>
              <td>
                <VTextField v-model="rule.currency" density="compact" hide-details variant="plain" placeholder="USD" :disabled="rule.ruleType === 'PERCENTAGE'" maxlength="3" />
              </td>
              <td class="text-center">
                <VBtn icon variant="text" size="x-small" color="error" :disabled="form.rules.length === 1" @click="removeRule(idx)">
                  <VIcon icon="tabler-trash" size="14" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <div v-if="form.rules.length" class="mt-4">
          <p class="text-caption text-disabled mb-1">{{ $gettext('Preview') }}</p>
          <div class="d-flex flex-wrap gap-1">
            <VChip v-for="(rule, idx) in form.rules" :key="idx" size="small" :color="ruleTypeColor[rule.ruleType] ?? 'default'" label>
              {{ ruleLabel(rule) }}
            </VChip>
          </div>
        </div>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" :disabled="!form.name.trim()" @click="save">
          {{ $gettext('Save') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.markup-rules-table :deep(td) { padding: 4px 6px !important; vertical-align: middle; }
.markup-rules-table :deep(th) { padding: 6px 6px !important; white-space: nowrap; }
</style>
