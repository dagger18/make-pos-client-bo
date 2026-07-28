<script setup>
import { downloadMonthlyLayout } from '@/config/forms/accounting/Revenue';
import MediaService from '@/services/MediaService';
const props = defineProps({
  ebitNoteType: {type: String, default: ''}
})
// EbitNoteService removed - freight-specific service no longer available
async function downloadMonthly(_entity) {
  return true
}
</script>
<template>
<DialogForm
  :apiService="{'add': downloadMonthly}"
  :modelValue="{
    language: 'vi', 
    month: '2024-05', 
    type: ebitNoteType,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }" 
  :layout="downloadMonthlyLayout"
  :class="'mt-n2'"
>
  <template #activator="props">
    <VBtn variant="tonal" color="gray" size="small" v-bind="props">
      <VIcon 
        icon="tabler-file-download" 
        size="26" class="me-2 ms-n2"
      />
      {{ $gettext("Download Monthly") }}
    </VBtn>
  </template>
  <template #SubmitBtn="{form}" >
    <SubmitBtn
      color="primary" class="mr-2" size="small"
      :removeLoadingOn504="false"
      @click="form.submit"
    >
      <template v-slot:prepend>
        <v-icon icon="tabler-file-download" size="24"></v-icon>
      </template>
      {{ $gettext('Download') }}
    </SubmitBtn>
    Might take at least 4-5 mins for download to start
  </template>
</DialogForm>
</template>
