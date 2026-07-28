<script setup>
const props = defineProps({
  modelValue: {type: Object, default: () => {}},
  layout: {type: Function, default: null},
  makeDefaultEntity: {type: Function, default: null},
  inputCallBack: {type: Object, default: () => {}},
  fullWidth: {type: Boolean, default: true},
  turnOffAllTitle: {type: Boolean, default: false},
  tabLayout: { type: Array, default: () => [] },
  context: { type: Object, default: () => {} },
})
const form = ref(null)
onMounted(() => {
  if(props.modelValue) {
    form.value.setEntity(props.modelValue)
  } else {
    form.value.setEntity(null)
  }
})
defineExpose({ form })
</script>
<template>
  <AppForm
    :layout="layout"
    :makeDefaultEntity="props.makeDefaultEntity"
    ref="form" :isSubForm="true" :isDialog="false"
    @update:modelValue="$emit('update:modelValue', $event)"
    :fullWidth="fullWidth"
    :inputCallBack="inputCallBack"
    :turnOffAllTitle="turnOffAllTitle"
    :tabLayout="tabLayout"
    :context="context"
  />
</template>
