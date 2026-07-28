<script setup>
import { enums as VolumeType } from '@/config/enums/VolumeType';
const props = defineProps({
  cargoVolumeType: { type: String, default: '' },
  cargoVolume: { type: Object, default: () => {} },
  variant: { type: String, default: 'outlined' },
  compact: { type: Boolean, default: false },
  pullLeft: { type: Boolean, default: false }
})
</script>
<template>
  <div v-if="props.cargoVolumeType === VolumeType.Container">
    <VChip 
      class="d-flex"  color="primary" :variant="props.variant"
      :class="[
        props.compact ? 'pa-0 mb-n2 mt-n1' : (index === props.cargoVolume.items.length-1 ? '' : 'mb-1'), 
        pullLeft ? 'text-left' : ''
      ]"
      v-for="(container, index) in props.cargoVolume.items.filter(i => i.amount)"
    >
      {{ container.title }} x {{ container.amount }}
    </VChip>
  </div>
  <div v-else>
    <VChip 
      class="d-flex" 
      :class="[props.compact ? 'pa-0 mb-n2 mt-n1' : 'mb-1', pullLeft ? 'text-left' : '']"
      color="info" 
      :variant="props.variant"
      v-if="props.cargoVolume.totalCBM && props.cargoVolume.totalCBM !== '0'"
    >
      CBM x {{ (props.cargoVolume.totalCBM*1).round(2) }}
    </VChip>
    <VChip 
      class="d-flex"
      :class="[props.compact ? 'pa-0' : '', pullLeft ? 'text-left' : '']"
      color="primary" 
      :variant="props.variant"
      v-if="props.cargoVolume.chargeableWeight && props.cargoVolume.chargeableWeight !== '0'"
    >
      KGS x {{ (props.cargoVolume.chargeableWeight*1).round(2) }}
    </VChip>
  </div>
</template>
