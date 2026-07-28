<script setup>
import { CBM, WEIGHT } from '@/config/enums/Unit';
import { layout, makeDefaultEntity } from '@/config/forms/quote/cargoVolume/VolumeByShipment';
import { multiFloat, useFloat } from '@/services/CommonService';
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
    && lastElement.volume === null 
    && lastElement.weight === null 
    && lastElement.volumeUnit === 'CBM' 
    && lastElement.weightUnit === 'KGS'
  ) {
    return
  }
  console.log('go up', state.items)
  emit('update:modelValue', {
    items: state.items.map(item => item), 
    totalUnit, totalCBM, totalWeight,
    chargeableWeight: chargeableWeight.value
  })
}
const chargeableWeight = computed(() => {
  return Math.max(totalWeight.value, totalCBM.value / CBM.KGS[props.context.transportType]).round(2)
})
const volumeWeight = computed(() => {
  return (totalCBM.value / CBM.KGS[props.context.transportType]).round(2)
})
const totalUnit = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + useFloat(item.amount),
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
const totalCBM = computed(() => {
  return state.items.reduce(
    (sum, item) => sum + multiFloat(
                          item.volumeUnit === 'KGS' 
                          ? CBM[item.volumeUnit][props.context.transportType] 
                          : CBM[item.volumeUnit], 
                          item.volume,
                        ),
    0,
  )
})
const instructionVolume = computed(() => {
  if(!props.context.instruction) return null
  if(!props.context.instruction.grossWeight
    && !props.context.instruction.volume
    && !props.context.instruction.chargeableWeight
    && !props.context.instruction.packageCount
    ) return null
  return props.context.instruction
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
<div>
  {{ $gettext('Shipment Total') }}: {{ totalUnit }} Unit(s)<br>
  <div v-if="totalCBM">
  {{ $gettext('Volume Weight') }}: {{ totalCBM.round(2) }} CBM, {{ volumeWeight }} KGS
  </div>
  {{ $gettext('Chargeable Weight') }}: {{ chargeableWeight }} KGS<br>
</div>
</div>
</template>
