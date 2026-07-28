<script setup>
import { filterConfigs, headers } from '@/config/tables/library/DutyRate'
import EntityService from '@/services/library/DutyRateService'
import DutyRateForm from '@/views/library/DutyRateForm.vue'
import { useLibraryHeader } from '@/composables/useLibraryHeader'
import { useGettext } from 'vue3-gettext'

definePage({ meta: { action: 'MANAGE', subject: 'DutyRate', navActiveLink: 'library-hs-code' } })
const { $gettext } = useGettext()

const table = ref(null)
const form = ref(null)
const buttons = computed(() => [{ text: $gettext('Add Duty Rate'), func: form.value?.setEntity }])
const { buttons: headerButtons } = useLibraryHeader()
watch(buttons, val => { headerButtons.value = val }, { immediate: true })
onUnmounted(() => { headerButtons.value = [] })

async function editEntity(id) {
  const entity = await EntityService.get(id)
  form.value.setEntity(entity)
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :filterConfigs="filterConfigs"
    :apiService="EntityService"
    ref="table"
    :hideTitle="true"
  >
    <template #action="{ item }">
      <v-btn @click="editEntity(item.id)" :title="$gettext('edit')" class="grey--text mx-0" variant="text" size="x-small">
        <VIcon icon="tabler-pencil" size="18"/>
      </v-btn>
      <SubmitBtn
        @click="table.handleDelete(item, $refs['delete-' + item.id])"
        :title="$gettext('delete')"
        class="grey--text mx-0 ml-n2" variant="text"
        :autoQueue="false"
        :ref="'delete-' + item.id"
        size="x-small"
      >
        <VIcon icon="tabler-trash" size="18"/>
      </SubmitBtn>
    </template>
  </AppTable>
  <DutyRateForm ref="form" @entitySubmitted="$refs.table.fetchData()" />
</template>
