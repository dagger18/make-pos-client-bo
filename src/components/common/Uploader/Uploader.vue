<script setup>
import MediaService from '@/services/MediaService';
import { useAppStore } from '@/stores/appStore';
import { useGettext } from 'vue3-gettext';
const { $gettext } = useGettext()
const props = defineProps({
  accept: { type: String, default: '*/*' },
  uploadInstantly: { type: Boolean, default: true },
  modelValue: { type: [Array, Object], default: () => [] },
  parentBind: { type: Object, default: null },
  single: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const state = reactive({
  files: []
})
const loading = ref(false)

const onInputChange = async (e) => {
  if(props.single) {
    state.files = []
  }
  addFiles(e.target.files)
  if(props.uploadInstantly) {
    await doUploadFiles()
  }
  emit('update:modelValue', props.single ? state.files[0] : state.files)
  e.target.value = null
}

function addFiles(newFiles) {
  for(let i = 0; i < newFiles.length; i++) {
    // todo: check file type, size here, mark error before push to file list
    state.files.unshift(
      {
        status: 'waiting', 
        file: newFiles[i],
        name: newFiles[i].name,
        size: newFiles[i].size,
        type: newFiles[i].type
      }
    )
  }
}

async function removeFile({objectFile, btn}) {
  if(props.uploadInstantly && (!objectFile.status || objectFile.status === 'done')) {
    const confirmed = await useAppStore().confirm.open(
      $gettext('Confirm your action'),
      $gettext('Do you want to permanently delete this file? You might need to download and backup this file first.'),
      { color: 'warning' }
    )
    if (!confirmed) {
      btn[0].disabled = false
      return
    }
    btn[0].addToQueuingList()
    const result = await MediaService.delete(objectFile.id, props.parentBind)
    if(result.error) {
      return
    }
  }
  const index = state.files.indexOf(objectFile)
  if (index > -1) state.files.splice(index, 1)
  btn[0].disabled = false
}

const uploadFile = async (fileObject) => {
  fileObject.status = 'loading'

  // Step 1: Get presigned upload URLs
  const presign = await MediaService.presign({
    filename: fileObject.name,
    mimeType: fileObject.type,
    size: fileObject.size,
  })
  if (!presign?.confirmToken) {
    fileObject.status = 'error'
    return fileObject
  }

  // Step 2: Upload directly to S3 and backup server in parallel
  try {
    await Promise.all([
      fetch(presign.s3UploadUrl, {
        method: 'PUT',
        body: fileObject.file,
        headers: { 'Content-Type': fileObject.type },
      }),
      fetch(presign.backupUploadUrl, {
        method: 'PUT',
        body: fileObject.file,
      }),
    ])
  } catch {
    fileObject.status = 'error'
    return fileObject
  }

  // Step 3: Confirm upload and create entity
  const response = await MediaService.confirm({
    confirmToken: presign.confirmToken,
    ...props.parentBind,
  })
  if (!response?.id) {
    fileObject.status = 'error'
    return fileObject
  }
  return { ...response, status: 'done' }
}
const doUploadFiles = async () => {
  loading.value = true
  const files = await Promise.all(
    state.files
      .map(
        async (file) => { 
          if(file.status === 'waiting') {
            return await uploadFile(file)
          }
          return file
        }
      )
  )
  state.files = files
  loading.value = false
  return 
}

onMounted(() => {
  const mv = props.modelValue
  state.files = Array.isArray(mv) ? mv : (mv ? [mv] : [])
})

</script>
<template>
  <v-row class="uploader-wrapper">
    <v-col :md="state.files.length > 0 ? 4 : false">
      <DropZone
        @files-dropped="async (files) => { if(props.single) state.files = []; addFiles(files); if(props.uploadInstantly) await doUploadFiles(); emit('update:modelValue', props.single ? state.files[0] : state.files) }"
        :loading="loading"
        #default="{ dropZoneActive }"
      >
        <label 
          for="file-input" 
          class="drop-area"
          :class="{
            'active': dropZoneActive
          }"
        >
          <div class="text-wrapper d-flex align-center flex-column" v-if="!loading">
            <div class="py-2">
              <VIcon 
                icon="tabler-file-upload" size="30" 
                :color="dropZoneActive ? 'primary' : ''" />
            </div>
            <div>
              <span class="font-weight-bold text-disabled text-center">{{ $gettext('Select your file to upload') }}</span>
              <span class="smaller text-disabled text-center text-body-2">
                {{ $gettext('or drag and drop it here') }}
              </span>
            </div>
          </div>
          <div class="loader-wrapper d-flex align-center flex-column" v-else>
            <VProgressCircular
              :size="60"
              width="3"
              color="primary"
              indeterminate
            />
            <span class="font-weight-bold py-4">{{ $gettext('Uploading file...') }}</span>
            <VBtn>{{ $gettext('Cancel') }}</VBtn>
          </div>
          <input 
            type="file" id="file-input" :accept="accept"
            :disabled="loading" :multiple="!single"
            @change="onInputChange" 
          />
        </label>
      </DropZone>
    </v-col>
    <v-col class="file-wrapper" v-if="state.files.length > 0">
      <FileList :files="state.files" @removeFile="removeFile" />
    </v-col>
  </v-row>
</template>
<style lang="scss">
.uploader-wrapper {
  .drop-area {
    display: block;
    padding: 0.5rem;
    border: 3px dashed #ddd;
    border-radius: 4px;
    background: #fff5;
    cursor: pointer;
    font-size: 1rem;
    inline-size: 100%;
    margin-block: 0;
    margin-inline: auto;
    transition: 0.2s ease;

    &.active {
      border-color: rgb(var(--v-theme-primary));
    }

    span {
      display: block;
    }

    input[type="file"]:not(:focus-visible) {
      position: absolute !important;
      overflow: hidden !important;
      padding: 0 !important;
      border: 0 !important;
      margin: -1px !important;
      block-size: 1px !important;
      clip: rect(0, 0, 0, 0) !important;
      inline-size: 1px !important;
      white-space: nowrap !important;
    }
  }

  .file-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    list-style: none;
  }

  .upload-button {
    display: block;
    border: 0;
    border-radius: 50px;
    appearance: none;
    background: #369;
    color: #fff;
    font-size: 1.25rem;
    font-weight: bold;
    margin-block: 1rem;
    margin-inline: auto;
    padding-block: 0.75rem;
    padding-inline: 3rem;
    text-transform: uppercase;
  }
}
</style>
