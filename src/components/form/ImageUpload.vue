<script setup>
import MediaService from '@/services/MediaService'

const props = defineProps({
  modelValue: { type: Object, default: null },
  previewWidth: { type: Number, default: 0 },
  previewHeight: { type: Number, default: 0 },
  imgPlaceholder: { type: String, default: 'tabler-cloud-upload' }
})

const emit = defineEmits(['update:modelValue', 'uploading'])

const uploadInput = ref(null)
const counter = ref(0)
const uploading = ref(false)
const uploadError = ref(false)
const previewSrc = ref(props.modelValue?.thumbnailPath ?? null)

watch(() => props.modelValue, (val) => {
  previewSrc.value = val?.thumbnailPath ?? null
  uploadError.value = false
})

async function change(e) {
  const file = e.target.files[0]
  if (!file) return

  const objectUrl = URL.createObjectURL(file)
  previewSrc.value = objectUrl
  uploading.value = true
  uploadError.value = false
  emit('uploading', true)

  try {
    const presign = await MediaService.presign({
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    })
    if (!presign?.confirmToken) throw new Error('presign failed')

    await Promise.all([
      fetch(presign.s3UploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }),
      fetch(presign.backupUploadUrl, {
        method: 'PUT',
        body: file,
      }),
    ])

    const media = await MediaService.confirm({ confirmToken: presign.confirmToken })
    if (!media?.id) throw new Error('confirm failed')

    previewSrc.value = media.thumbnailPath
    emit('update:modelValue', media)
  } catch {
    uploadError.value = true
    previewSrc.value = props.modelValue?.thumbnailPath ?? null
  } finally {
    uploading.value = false
    emit('uploading', false)
    URL.revokeObjectURL(objectUrl)
  }
}

function removeFile() {
  counter.value++
  emit('update:modelValue', null)
  emit('uploading', false)
}
</script>

<template>
  <span class="mb-2">
    <input class="d-none" ref="uploadInput" :key="counter" type="file" accept="image/*" @change="change($event)" />
    <div
      class="upload-wrapper"
      :style="{
        height: previewHeight !== 0 ? (previewHeight + 'px') : 'auto',
        width: previewWidth !== 0 ? (previewWidth + 'px') : '100%',
        paddingTop: previewWidth !== 0 ? '' : '100%'
      }"
      v-if="!previewSrc"
      @click="uploadInput.click()"
    >
      <VIcon :icon="imgPlaceholder" size="40"/>
    </div>

    <v-badge
      v-if="previewSrc"
      right color="error" overlap
      :rounded="'sm'"
      class="remove-file-badge"
      :class="{ fullWidthUpload: previewWidth === 0 }"
      :offset-x="18"
      :offset-y="18"
    >
      <template v-slot:badge>
        <span @click="removeFile">
          <VIcon icon="tabler-trash-x" size="21"/>
        </span>
      </template>
      <v-card
        :style="{
          height: previewHeight !== 0 ? (previewHeight + 'px') : 'auto',
          width: previewWidth !== 0 ? (previewWidth + 'px') : '100%',
          overflow: 'hidden',
          paddingTop: previewWidth !== 0 ? '' : '100%',
          display: 'flex'
        }"
        variant="outlined"
      >
        <div v-if="uploading" class="upload-loading d-flex align-center justify-center flex-column">
          <VProgressCircular size="36" width="3" color="primary" indeterminate />
        </div>
        <div v-else-if="uploadError" class="upload-loading d-flex align-center justify-center flex-column text-error"
          @click="uploadInput.click()"
        >
          <VIcon icon="tabler-alert-circle" size="30" />
          <span class="text-caption mt-1" v-translate>Upload failed. Click to retry.</span>
        </div>
        <v-img
          v-else
          contain
          :src="previewSrc"
          @click="uploadInput.click()"
        />
      </v-card>
    </v-badge>
  </span>
</template>

<style lang="scss">
.remove-file-badge {
  i {
    cursor: pointer;
    font-size: 21px;
  }
}

.upload-wrapper {
  position: relative;
  border: 2px dashed #eee;
  border-radius: 5px;
  background: #fafafa;
  cursor: pointer;

  i {
    position: absolute;
    color: #ccc;
    font-size: 2rem;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
  }
}

.upload-loading {
  position: absolute;
  inset: 0;
  background: #fff8;
}

.v-badge.fullWidthUpload {
  inline-size: 100%;

  .v-img {
    position: absolute;
    inset-block-start: 0;
    margin-block-start: 0 !important;
    width: 100%;
    height: 100%;
  }
}

.v-badge.remove-file-badge {
  .v-img {
    cursor: pointer;
  }

  .v-badge__badge {
    padding: 0;
  }
}
</style>
