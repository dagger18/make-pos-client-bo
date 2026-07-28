<script setup>
import {
  enums as EntityType
} from "@/config/enums/DatasetType";
import { layout, makeDefaultEntity } from '@/config/forms/report/Dataset';
import CommonService, { transformArray, transformPreSubmit } from '@/services/CommonService';
import EntityService from '@/services/DatasetService';
import { useAuthStore } from '@/stores/authStore';
const form = ref(null)
function setEntity(entity = null) {
  form.value.setEntity(entity)
}
defineExpose({
  setEntity
})
async function fetchDataTable() {
  console.log(form.value.$refs,'form.value.$refs')
  console.log(form.value.$refs.table[0], 'form.value.$refs.table')
  await form.value.$refs.table[0].fetchData()
}
function entityPreSubmit (reactiveEntity) {
  const entity = JSON.parse(JSON.stringify(reactiveEntity))
  
  transformPreSubmit(entity)
  
  if (entity.filters && entity.filters.length > 0) {
    entity.filters = entity.filters
                      .filter(
                        f => !!f.property && !!f.operator && !!f.value
                      )
    transformArray(entity, 'filters')
  }
  console.log('done transform')
  console.log(JSON.parse(JSON.stringify(entity)))
  return entity
}
function onEntityTypeChanged(entity, columns, value) {
  delete entity.rowType
  onRowTypeChanged(entity, columns, value)
}
function onRowTypeChanged(entity, columns, value) {
  delete entity.groupColumn
  onGroupColumnChanged(entity, columns, value)
}
function onGroupColumnChanged(entity, columns, value) {
  delete entity.dateSegment
  delete entity.columns
  delete entity.filters
}
function exportExcel(withChargeDetails = false) {
  const { accessToken, user } = useAuthStore()
  const extraParams = {
                      export: true,
                      YXV0aFRva2Vu: accessToken,
                      ZW1haWw: user.email,
                      exportFileName: form.value.entity.name
                    }
  if(withChargeDetails) {
    extraParams.exportType = 'exportChargeDetails'
  }
  const params = form.value.$refs.table[0].buildParams(false, extraParams)
  const url = form.value.$refs.table[0].apiService.list(CommonService.serialize(params))
  window.open(url, '_blank')
}
const isReportingShipmentEntity = computed(() => {
  console.log(form.value, EntityType.Shipment,'check is reporting')
  if (!form.value) return false
  console.log(form.value.entity.entityType,'check is reporting')
  console.log(form.value.entity.entityType,'check is reporting')
  return form.value.entity.entityType == EntityType.Shipment
    && form.value.entity.rowType === 'Entity'
})
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('Dataset')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :entityPreSubmit="entityPreSubmit"
    @entitySubmitted="$emit('entitySubmitted')"
    :inputCallBack="{
      entityType: onEntityTypeChanged,
      rowType: onRowTypeChanged,
      groupColumn: onGroupColumnChanged
    }"
  >
    <template #SubmitBtn="{entity}">
      <SubmitBtn
        color="primary" class="mr-2" size="default"
        @click="form.submit"
      >
        <template v-slot:prepend>
          <v-icon icon="tabler-device-floppy" size="24"></v-icon>
        </template>
        {{ $gettext('Save') }}
      </SubmitBtn>
      <SubmitBtn
        color="warning" class="mr-2" size="default" variant="tonal"
        @click="fetchDataTable"
      >
        <template v-slot:prepend>
          <v-icon icon="tabler-eye" size="24"></v-icon>
        </template>
        {{ $gettext('Preview') }}
      </SubmitBtn>
      <SubmitBtn
        class="mr-2" size="default" variant="tonal"
        @click="exportExcel"
      >
        <template v-slot:prepend>
          <v-icon icon="tabler-file-download" size="24"></v-icon>
        </template>
        {{ $gettext('Export') }}
      </SubmitBtn>
      <SubmitBtn
        v-if="isReportingShipmentEntity"
        class="mr-2" size="default" variant="tonal"
        @click="exportExcel(true)"
      >
        <template v-slot:prepend>
          <v-icon icon="tabler-file-download" size="24"></v-icon>
        </template>
        {{ $gettext('Export Charge Details') }}
      </SubmitBtn>
    </template>
    
  </AppForm>
</template>
