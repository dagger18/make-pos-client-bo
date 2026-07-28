<script setup>
import { filterConfigs, headers } from '@/config/tables/ChartOfAccounts'
import ChartOfAccountService from '@/services/ChartOfAccountService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'ChartOfAccounts' } })

const { $gettext } = useGettext()

const table    = ref(null)
const editing  = ref(null)
const editName = ref('')

const typeColor = { ASSET: 'info', LIABILITY: 'warning', REVENUE: 'success', COST: 'error', OTHER: 'default' }

function startEdit(account) {
  editing.value  = account.id
  editName.value = account.name
}

async function saveEdit(account) {
  await ChartOfAccountService.update(account.id, { name: editName.value })
  editing.value = null
  await table.value?.fetchData()
}

async function toggleActive(account) {
  await ChartOfAccountService.update(account.id, { isActive: !account.isActive })
  await table.value?.fetchData()
}
</script>

<template>
  <AppTable
    ref="table"
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="ChartOfAccountService"
    :pageTitle="$gettext('Chart of Accounts')"
  >
    <template #name="{ item }">
      <VTextField
        v-if="editing === item.id"
        v-model="editName"
        density="compact"
        hide-details
        autofocus
        @keyup.enter="saveEdit(item)"
        @keyup.escape="editing = null"
      />
      <span v-else>{{ item.name }}</span>
    </template>

    <template #accountType="{ item }">
      <VChip :color="typeColor[item.accountType] ?? 'default'" size="small" label>
        {{ item.accountType }}
      </VChip>
    </template>

    <template #isActive="{ item }">
      <VIcon
        :icon="item.isActive ? 'tabler-circle-check' : 'tabler-circle-x'"
        :color="item.isActive ? 'success' : 'error'"
        size="18"
      />
    </template>

    <template #action="{ item }">
      <template v-if="editing !== item.id">
        <VBtn size="x-small" variant="text" @click="startEdit(item)">
          <VIcon icon="tabler-pencil" size="16" />
        </VBtn>
      </template>
      <template v-else>
        <VBtn size="x-small" variant="text" color="success" @click="saveEdit(item)">
          <VIcon icon="tabler-check" size="16" />
        </VBtn>
        <VBtn size="x-small" variant="text" @click="editing = null">
          <VIcon icon="tabler-x" size="16" />
        </VBtn>
      </template>
      <VBtn
        size="x-small"
        variant="text"
        :color="item.isActive ? 'error' : 'success'"
        :title="item.isActive ? $gettext('Deactivate') : $gettext('Activate')"
        @click="toggleActive(item)"
      >
        <VIcon :icon="item.isActive ? 'tabler-eye-off' : 'tabler-eye'" size="16" />
      </VBtn>
    </template>
  </AppTable>
</template>
