<script setup>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
const [modal, toggleModal] = useToggle()
const fileInput = ref(null)
const cropper = ref(null)
const image = reactive({
  src: null,
  type: null,
  name: null
})
function openFilePicker() {
  fileInput.value.click()
}
const emit = defineEmits(['cropped'])
function cropped() {
  const { canvas } = cropper.value.getResult();
  canvas.toBlob((blob) => {
    emit('cropped', new File([blob], image.name))
    toggleModal()
  }, image.type);
}
function filePicked(event) {
  toggleModal(true)
  const { files } = event.target;
  if (files && files[0]) {
    // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
    if (image.src) {
      URL.revokeObjectURL(image.src)
    }
    image.name = files[0].name
    const blob = URL.createObjectURL(files[0]);
    const reader = new FileReader();
    reader.onload = (e) => {
      image.src =  blob
      image.type = getMimeType(e.target.result, files[0].type)
    };
    reader.readAsArrayBuffer(files[0]);
  }
}
function getMimeType(file, fallback = null) {
	const byteArray = (new Uint8Array(file)).subarray(0, 4);
    let header = '';
    for (let i = 0; i < byteArray.length; i++) {
       header += byteArray[i].toString(16);
    }
	switch (header) {
        case "89504e47":
            return "image/png";
        case "47494638":
            return "image/gif";
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
            return "image/jpeg";
        default:
            return fallback;
    }
}
onBeforeUnmount(() => {
  if (image.src) {
    URL.revokeObjectURL(image.src)
  }
})
</script>
<template>
<VDialog v-model="modal" persistent max-width="600">
  <div class="d-flex">
    <VSpacer></VSpacer>
    <SubmitBtn class="mb-2 me-2" @click="cropped">
      <VIcon icon="tabler-check" size="24" class="me-2" />
      {{ $gettext('Looks good') }} !!!
    </SubmitBtn>
    <VBtn class="mb-2" color="white"
      @click="toggleModal(false)"
    >
      {{ $gettext('Close') }}
    </VBtn>
  </div>
  <Cropper
    class="cropper" ref="cropper" image-restriction="stencil"
    :src="image.src"
    :stencil-props="{ handlers: {}, movable: false}"
    :stencil-size="{ width: 280, height: 280}"
  />
</VDialog>
<input
  ref="fileInput" type="file" name="file" hidden
  accept=".jpeg,.png,.jpg,GIF"
  @input="filePicked($event)"
/>
<slot :openFilePicker="openFilePicker"></slot>
</template>
<style type="scss">
.cropper {
  block-size: 600px;
}
</style>
