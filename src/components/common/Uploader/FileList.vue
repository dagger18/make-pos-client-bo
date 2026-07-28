<script setup>
import MediaService from '@/services/MediaService';
import { displayFileSize } from '@/services/CommonService';
const props = defineProps({
  files: { type: Array, default: () => []}
})
const dynamicIcons = [
  'tabler-file-type-pdf',
  'tabler-file-type-png',
  'tabler-file-type-jpg',
  'tabler-file-type-txt',
  'tabler-file-type-doc',
  'tabler-file-type-docx'
]
</script>
<template>
<v-slide-y-transition
  class="py-0" group tag="v-list"
>
  <template v-for="(objectFile, i) in files" :key="i">
    <v-list-item class="px-0">
      <template v-slot:prepend>
        <VIcon icon='tabler-file-dots' class="mr-1" size="24"/>
        <VIcon 
          :icon="(objectFile.type ? ('tabler-file-type-' + objectFile.type) : '')" 
          class="ms-n7 mr-1" size="24" style="opacity: 1;"
        />
      </template>

      <v-list-item-title class="me-4 text-body-2">
        <span 
          :class="objectFile.status === 'loading' ? 'text-grey' : ''"
        >{{ objectFile.name }}</span>
      </v-list-item-title>

      <template v-slot:append>
        <div class="append-wrapper d-flex align-center">
          <div class="progress-wrapper pr-2">
            <div class="size text-body-2 text-disabled">
              <span v-if="objectFile.status !== 'error'">{{ displayFileSize(objectFile.size) }}</span>
              <span v-if="objectFile.status === 'loading'"><translate>Uploading</translate> ...</span>
              <span v-if="objectFile.status === 'error'" class="text-error"><translate>Upload failed</translate></span>
            </div>
            <v-progress-linear 
              color="primary" indeterminate rounded height="6" 
              v-if="objectFile.status === 'loading'" 
            />
          </div>

          <VBtn
            v-if="objectFile.id"
            variant="text"
            color="primary"
            size="20"
            class="px-0 me-1"
            @click="MediaService.download(objectFile.id)"
          >
            <VIcon icon="tabler-download" size="16"/>
          </VBtn>

          <SubmitBtn
            variant="text"
            color="warning"
            size="20"
            class="px-0 me-1"
            :ref="'remove-file' + i"
            @click="$emit('removeFile', {objectFile, btn: $refs['remove-file' + i]})"
            :autoQueue="false"
          >
          <VIcon icon="tabler-trash" size="16"/>
          </SubmitBtn>

          <VIcon v-if="objectFile.status === 'error'" color="error" icon="tabler-alert-triangle" size="21" />
        </div>
      </template>
    </v-list-item>
    <v-divider />
  </template>
</v-slide-y-transition>
</template>
