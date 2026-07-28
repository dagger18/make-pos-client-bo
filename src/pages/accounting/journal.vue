<script setup>
import { filterConfigs, headers } from '@/config/tables/Journal'
import JournalService from '@/services/JournalService'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'GET', subject: 'EbitNote' } })

const { $gettext } = useGettext()

const selected = ref(null)

async function openDetail(entry) {
  selected.value = await JournalService.get(entry.id)
}
</script>

<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="JournalService"
    :pageTitle="$gettext('Journal Entries')"
  >
    <template #isPosted="{ item }">
      <VIcon
        :icon="item.isPosted ? 'tabler-circle-check' : 'tabler-clock'"
        :color="item.isPosted ? 'success' : 'warning'"
        size="16"
      />
    </template>

    <template #action="{ item }">
      <VBtn size="x-small" icon variant="text" @click="openDetail(item)">
        <VIcon icon="tabler-eye" size="16" />
      </VBtn>
    </template>
  </AppTable>

  <VDialog :model-value="!!selected" max-width="700" @update:model-value="v => { if (!v) selected = null }">
    <VCard v-if="selected" :title="selected.journalNumber">
      <VCardText>
        <VTable density="compact">
          <thead>
            <tr>
              <th>{{ $gettext('Account') }}</th>
              <th class="text-right">{{ $gettext('Debit') }}</th>
              <th class="text-right">{{ $gettext('Credit') }}</th>
              <th>{{ $gettext('Ccy') }}</th>
              <th>{{ $gettext('Description') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in selected.lines" :key="i">
              <td>{{ l.account }}</td>
              <td class="text-right">{{ l.debit > 0 ? Number(l.debit).toLocaleString() : '' }}</td>
              <td class="text-right">{{ l.credit > 0 ? Number(l.credit).toLocaleString() : '' }}</td>
              <td>{{ l.currency }}</td>
              <td>{{ l.description }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn @click="selected = null">{{ $gettext('Close') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
