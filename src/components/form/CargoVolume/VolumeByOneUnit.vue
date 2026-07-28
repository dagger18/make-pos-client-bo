<script setup>
import { CBM, WEIGHT } from '@/config/enums/Unit';
import { layout, makeDefaultEntity } from '@/config/forms/quote/cargoVolume/VolumeByOneUnit';
import { multiFloat } from '@/services/CommonService';
const props = defineProps({
  modelValue: {},
  context: {type: Object, default: () => {}}
})
const state = reactive({
  items: props.modelValue && props.modelValue.items && props.modelValue.items.length > 0 ? props.modelValue.items : [makeDefaultEntity()]
})
const reloader = ref(0)

const emit = defineEmits(['update:modelValue'])
function onUpdate() {
  const lastElement = state.items[0]
  if(lastElement.amount === null
    && lastElement.height === null 
    && lastElement.width === null 
    && lastElement.length === null 
    && lastElement.weight === null 
    && lastElement.dimensionUnit === 'CBM' 
    && lastElement.weightUnit === 'KGS'
  ) {
    return
  }
  console.log('go up', state.items)
  emit('update:modelValue', {
    items: state.items.map(item => item),
    totalCBM, totalWeight, totalUnit: 1, 
    chargeableWeight: Math.max(totalWeight.value, totalCBM.value * CBM.KGS[props.context.transportType]).round(2)
  })
}

const totalCBM = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + multiFloat(
                          CBM[item.dimensionUnit],
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
</div>
<div>{{ $gettext('Total') }}: {{ totalCBM }} CBM, {{ totalWeight }} KG</div>
</div>
</template>
