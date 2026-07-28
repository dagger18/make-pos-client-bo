<script setup>
import { filterConfigs, headers } from '@/config/tables/Client';
import EntityService from '@/services/ClientService';
import CommonService from '@/services/CommonService';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import ClientDetail from '@/views/client/ClientDetail.vue';
import ClientForm from '@/views/client/ClientForm.vue';
import { can } from '@layouts/plugins/casl';
import { useGettext } from "vue3-gettext";
definePage({ 
  meta: { action: 'GET', subject: 'Client' },
})
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const table = ref(null)
const form = ref(null)
const detail = ref(null)
const { $gettext } = useGettext()
const buttons = computed(() => {
  return can('POST', 'Client') ? [
     {
      text: $gettext('Add client'),
      func: form.value?.setEntity
    }
  ] : []
})
function exportExcel() {
  const { accessToken, user } = useAuthStore()
  const extraParams = {
                      export: true,
                      YXV0aFRva2Vu: accessToken,
                      ZW1haWw: user.email,
                      exportFileName: 'ClientData',
                      rowType: 'Entity'
                    }
  const params = table.value.buildParams(false, extraParams)
  const url = EntityService.list(CommonService.serialize(params))
  window.open(url, '_blank')
}
</script>
<template>
  <AppTable
    :headers="headers()"
    :buttons="buttons"
    :filterConfigs="getFilterConfigs"
    :apiService="EntityService"
    ref="table"
    :pageTitle="$gettext('Clients')"
  >
    <!-- Displayed Items -->
    <template #action="{ item }">
      <v-btn
      v-if="$can('PUT', 'Client')"
        @click="$router.push({ 
            name: 'accounting-type-target?', 
            params: {
              type: 'SOA-Client', 
              target: item.id
            } 
          })"
        :title="$gettext('view SOA')"
        class="grey--text mx-0" variant="text"
        size="x-small"
      >
        <VIcon icon="tabler-eye-dollar" size="18"/>
      </v-btn>
      <v-btn
      v-if="$can('PUT', 'Client')"
        @click="$refs.detail.setEntity(item.id)"
        :title="$gettext('edit')"
        class="grey--text mx-0" variant="text"
        size="x-small"
      >
        <VIcon icon="tabler-pencil" size="18"/>
      </v-btn>
      <SubmitBtn
        v-if="$can('DELETE', 'Client')"
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
    <template #tableAction >
      <VBtn variant="tonal" color="gray" size="small" @click="exportExcel">
        <VIcon 
          icon="tabler-file-download" 
          size="26" class="me-2 ms-n2"
        />
        {{ $gettext("Export") }}
      </VBtn>
    </template>
  </AppTable>
  <ClientForm
    ref="form"
    @entitySubmitted="$refs.table.fetchData()"
  />
  <ClientDetail
    ref="detail"
    @closed="$refs.table.fetchData()"
  />
</template>
