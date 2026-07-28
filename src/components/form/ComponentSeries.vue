<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/report/ComponentSeries';
const props = defineProps({
  modelValue: {},
  context: {type: Object, default: () => {}}
})
const state = reactive({
  items: (props.modelValue && props.modelValue.length > 0 ? props.modelValue : []).concat([makeDefaultEntity()])
})
const reloader = ref(0)
function add() {
  const newEntity = makeDefaultEntity()
  state.items.push(newEntity)
}
function remove(index) {
  state.items.splice(index, 1)
  reloader.value += 1
}

const emit = defineEmits(['update:modelValue'])
function onUpdate() {
  // todo: should I debounce it here, in case long items list react :))
  const lastElement = state.items[state.items.length - 1]
  if(!lastElement) return
  if(lastElement.type === null
    && lastElement.color === null
    && lastElement.column === null
  ) {
    console.log('you are updating it here', JSON.parse(JSON.stringify(toRaw(state.items))))
    const items = JSON.parse(JSON.stringify(state.items
      .filter((i, idx) => idx !== state.items.length - 1)))
    emit('update:modelValue', items)
  } else {
    add()
  }
}
function notLastRemoveBtn(index) {
  return index !== state.items.length - 1
}
</script>
<template>
<div style=" display: grid;overflow-x: scroll;">
  <template 
    v-for="(item, index) in state.items" 
    :key="index+'-'+reloader"
  >
    <SubForm 
      v-model="state.items[index]"
      :layout="layout"
      :makeDefaultEntity="makeDefaultEntity"
      @update:modelValue="onUpdate"
      :fullWidth="false"
      :turnOffAllTitle="index !== 0"
      class="mb-2 d-flex"
      :context="context"
    >
    </SubForm>
    <VBtn
      @click="notLastRemoveBtn(index) ? remove(index) : null"
      variant="text" size="38" class="mt-n12 mb-0 stickyRemoveBtn" color="error"
    >
      <VIcon 
        icon="tabler-trash" size="20" 
        v-if="notLastRemoveBtn(index)"
      ></VIcon>
      <template v-else>&nbsp;</template>
    </VBtn>
  </template>
  
</div>
</template>
