<script setup>
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';

const appStore = useAppStore()
const { errorMessages } = storeToRefs(appStore)
function calcMargin(i) {
  return (i*60) + 'px'
}
let removeTimeout = null
watch(
  errorMessages, 
  (errorMessages) => {
    if(errorMessages.length > 0) {
      clearTimeout(removeTimeout)
      removeTimeout = setTimeout(() => {
        errorMessages.shift()
      }, 5000)
    } else {
      clearTimeout(removeTimeout)
    }
  }, 
  { deep: true }
)
</script>

<template>
  <VSnackbar 
    location="bottom right"
    timeout="-1"
    :color="errorMessage.success ? 'success' : 'error'"
    :modelValue="true"
    variant="tonal"
    class="error-snackbar me-8 mb-2"
    v-for="(errorMessage, index) in errorMessages"
    :style="{'margin-bottom':calcMargin(index)}"
  >
    <div class="d-flex" v-if="!errorMessage.success">
      <VIcon color="warning" icon="tabler-alert-triangle-filled" class="mr-2"></VIcon>
      [{{ errorMessage['code'] ?? errorMessage['status'] ?? '500' }}]
      <pre 
        style="
            margin-inline-start: 10px;
            max-block-size: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
        " 
        v-html="errorMessage['error'] ?? errorMessage['detail'] ?? 'Internal server error'"
      ></pre>
    </div>
    <div class="d-flex" v-else>
      <VIcon color="success" icon="tabler-check" class="mr-2 mt-n1 mb-n1" size="28"></VIcon>
      <pre 
        style="
            margin-inline-start: 10px;
            max-block-size: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
        " 
      >{{ errorMessage['detail'] ?? $gettext('Record saved successfully') }}</pre>
    </div>
    <template #actions>
      <VBtn
        @click="errorMessages.splice(index, 1)"
      >
        <VIcon color="error" icon="tabler-x"></VIcon>
      </VBtn>
    </template>
  </VSnackbar>
</template>
