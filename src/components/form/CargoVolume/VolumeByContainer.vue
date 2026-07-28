<script setup>
import { getList } from '@/config/enums/ContainerType';
const props = defineProps({
  modelValue: {}
})
const initState = getList.map(item => {return {...item, amount:null}})
if(props.modelValue
  && props.modelValue.items
  && props.modelValue.items.length > 0
) {
  props.modelValue.items.forEach(i => {
    const equivalentOfI = initState.find(({value}) => i.value === value)
    equivalentOfI.amount = i.amount
  })
}
const state = reactive({
  items: initState
})
const reloader = ref(0)

const emit = defineEmits(['update:modelValue'])
let updateTimeout = null
function onUpdate() {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    console.log('I do push', JSON.parse(JSON.stringify(state.items)))
    emit(
      'update:modelValue', 
      {
        items: state.items
                .filter(({amount}) => amount)
                .map(({value, amount}) => { return {value, amount}})
      }
    )
  }, 100)
  
}
</script>
<template>
<VRow class="mt-0" dense>
<VCol cols="2" lg="1"
  v-for="(item, index) in state.items" class="mb-2 d-flex flex-column" :key="index+'-'+reloader">
  <VBtn variant="outlined" class="rounded-t-sm rounded-b-0">{{ item.title }}</VBtn>
  <VTextField 
    type="number"  min="0"
    class="rounded-t-0 rounded-b-sm text-center"
    v-model="state.items[index].amount" 
    @update:modelValue="onUpdate"
  />
</VCol>

</VRow>
</template>
