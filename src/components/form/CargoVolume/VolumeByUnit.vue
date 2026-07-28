<script setup>
import { CBM, WEIGHT } from '@/config/enums/Unit';
import { layout, makeDefaultEntity } from '@/config/forms/quote/cargoVolume/VolumeByUnit';
import { multiFloat, useFloat } from '@/services/CommonService';
const props = defineProps({
  modelValue: {},
  context: {type: Object, default: () => {}}
})
const state = reactive({
  items: (props.modelValue && props.modelValue.items && props.modelValue.items.length > 0 ? props.modelValue.items : []).concat([makeDefaultEntity()])
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
  if(lastElement.amount === null
    && lastElement.dimensionUnit === 'CM' 
    && lastElement.weightUnit === 'KGS'
  ) {
    console.log('you are updating it here', JSON.parse(JSON.stringify(toRaw(state.items))))
    const items = JSON.parse(JSON.stringify(state.items
      .filter((i, idx) => idx !== state.items.length - 1)))
    const chargeableWeight = Math.max(totalWeight.value, totalCBM.value * CBM.KGS[props.context.transportType]).round(2)
    console.log(chargeableWeight, 'chargeableWeight')
    const data = {
      items, 
      totalUnit, totalCBM, totalWeight,
      chargeableWeight
    }
    emit('update:modelValue', data)
  } else {
    add()
  }
}

const totalUnit = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + useFloat(item.amount),
    0,
  ).round(4)
})
const totalCBM = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + multiFloat(
                          CBM[item.dimensionUnit], 
                          item.amount, 
                          item.width, 
                          item.height, 
                          item.length
                        ),
    0,
  ).round(4)
})
const totalWeight = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + multiFloat(
                          WEIGHT[item.weightUnit], 
                          item.amount, 
                          item.weight,
                        ),
    0,
  ).round(4)
})
</script>
<template>
<div>
  <div 
    v-for="(item, index) in state.items" class="mb-2 d-flex" :key="index+'-'+reloader">
    <SubForm 
      v-model="state.items[index]"
      :layout="layout"
      :makeDefaultEntity="makeDefaultEntity"
      @update:modelValue="onUpdate"
    >
    </SubForm>
    <VBtn 
      @click="remove(index)"
      variant="text" size="38" class="mt-7 mb-0" color="error"
      v-if="index !== state.items.length - 1"
    >
      <VIcon icon="tabler-trash" size="20"></VIcon>
    </VBtn>
    <VBtn 
      
      variant="text" size="38" class="mt-7 mb-0" color="error"
      v-else="index !== state.items.length - 1"
    >
      &nbsp;
    </VBtn>
  </div>
  <div>{{ $gettext('Total') }}: {{ totalUnit }} Unit(s), {{ totalCBM }} CBM, {{ totalWeight }} KG</div>
</div>
</template>
