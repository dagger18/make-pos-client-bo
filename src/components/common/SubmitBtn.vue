<script setup>
import { useAppStore } from '@/stores/appStore';
import { v4 as uuidv4 } from 'uuid';
import { watch } from 'vue';

const props = defineProps({
  autoQueue: {
    type: Boolean, default: true
  },
  removeLoadingOn504: {
    type: Boolean, default: true
  }
})
const emit = defineEmits(['click'])
const appStore = useAppStore()
const loading = ref(false)
const disabled = ref(false)
let enableTimeout = null
let loadingTimeout = null
const componentId = uuidv4()

watch(
  () => appStore.loadingBtnList,
  (newValue, oldValue) => {
    const diffAdded = newValue.filter(item => oldValue.indexOf(item) === -1)
    if(diffAdded.includes(componentId)) {
      onLoading()
    }
    const diffRemoved = oldValue.filter(item => newValue.indexOf(item) === -1)
    if(diffRemoved.includes(componentId)) {
      resetState()
    }
  },
  { deep: true }
)

const onClick = () => {
  disabled.value = true
  if (props.autoQueue) {
    addToQueuingList()
  }
  emit('click')
}
const addToQueuingList = () => {
  appStore.queuingBtnList.push(componentId)
  enableTimeout = setTimeout(() => {
    removeFromQueuingList()
    const index = appStore.loadingBtnList
      .findIndex(
        btn => btn === componentId
      )
    if (index === -1) {
      disabled.value = false
    }
  }, 500)
}
const onLoading = () => {
  clearTimeout(enableTimeout)
  enableTimeout = null
  loading.value = true
  disabled.value = true
  if(props.removeLoadingOn504) {
    loadingTimeout = setTimeout(() => {
      if (loading) {
        resetState()
      }
    }, 40000)
  }
  
}
const removeFromQueuingList = () => {
  const index = appStore.queuingBtnList
    .findIndex(
      btn => {
        btn === componentId
      }
    )
  if (index > -1) {
    appStore.queuingBtnList.splice(index, 1)
  }
}
const removeFromLoadingList = () => {
  const index = appStore.loadingBtnList
    .findIndex(
      btn => btn === componentId
    )
  if (index > -1) {
    appStore.loadingBtnList.splice(index, 1)
  }
}
const resetState = () => {
  removeFromQueuingList()
  removeFromLoadingList()
  disabled.value = false
  loading.value = false
  clearTimeout(loadingTimeout)
  clearTimeout(enableTimeout)
  loadingTimeout = null
  enableTimeout = null
}
defineExpose({
  addToQueuingList,
  disabled
})
</script>
<template>
  <v-btn
    @click="onClick"
    class="submit-btn font-weight-medium"
    :disabled="disabled"
    :loading="loading"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" :key="name" />
    </template>
    <template #loader>
      <VProgressCircular
      indeterminate size="24" width="2"
      :color="$attrs.color ?? 'primary'"
    />
      </template>
  </v-btn>
</template>
<style lang="scss" scoped>
.custom-loader {
  display: flex;
  animation: loader 1s infinite;
}

@keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
