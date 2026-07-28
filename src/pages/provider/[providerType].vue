<script setup>
import { getList, slugToProviderType } from '@/config/enums/ProviderType';
import { filterConfigs, headers } from '@/config/tables/Provider';
import CommonService from '@/services/CommonService';
import EntityService from '@/services/ProviderService';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import ProviderDetail from '@/views/provider/ProviderDetail.vue';
import ProviderForm from '@/views/provider/ProviderForm.vue';
import { can } from '@layouts/plugins/casl';
import { useGettext } from "vue3-gettext";
definePage({ 
  meta: { action: 'GET', subject: 'Provider' },
})
const table = ref(null)
const form = ref(null)
const detail = ref(null)
const route = useRoute()
const appStore = useAppStore()
const getFilterConfigs = () => filterConfigs(appStore)
const currentType = reactive(slugToProviderType(route.params.providerType))

const { $gettext } = useGettext()
const buttons = computed(() => {
  return can('POST', 'Provider') ? [
     {
      text: $gettext('Add provider'),
      func: form.value?.setEntity
    }
  ] : []
})

const apiCallParam = computed(() => {
  return {'filter_type': currentType.value}
})
watch(() => route, () => {
  if(route.name !== 'provider-provider-type') return
  const {value, plural, slug} = slugToProviderType(route.params.providerType)
  currentType.value = value
  currentType.slug = slug
  currentType.plural = plural
  nextTick(() => {
    table.value.fetchData()
  })
}, {
  deep: true
})
function exportExcel() {
  const { accessToken, user } = useAuthStore()
  const extraParams = {
                      export: true,
                      YXV0aFRva2Vu: accessToken,
                      ZW1haWw: user.email,
                      exportFileName: 'ProviderData',
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
    :apiCallParam="apiCallParam"
    ref="table"
    :pageTitle="$gettext('Providers')"
  >
    <template v-slot:beforeTable>
      <VTabs :modelValue="currentType.value" class="mt-1 mb-n2">
        <v-tab v-for="tab of getList" 
          :value="tab.value"
          @click="$router.push({ 
            name: 'provider-provider-type', 
            params: {providerType: tab.slug} 
          })"
        >
          {{tab.plural}}
        </v-tab>
      </VTabs>
    </template>
    <!-- Displayed Items -->
    <template #action="{ item }">
      <v-btn
      v-if="$can('PUT', 'Provider')"
        @click="$refs.detail.setEntity(item.id)"
        :title="$gettext('edit')"
        class="grey--text mx-0" variant="text"
        size="x-small"
      >
        <VIcon icon="tabler-pencil" size="18"/>
      </v-btn>
      <SubmitBtn
        v-if="$can('DELETE', 'Provider')"
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
  <ProviderForm 
    ref="form" 
    :currentType="currentType" 
    @entitySubmitted="$refs.table.fetchData()"
  />
  <ProviderDetail
    ref="detail"
    @closed="$refs.table.fetchData()"
  />
</template>
