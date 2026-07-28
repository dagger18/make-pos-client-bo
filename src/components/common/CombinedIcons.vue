<script setup>
const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: Number, default: 21 }
})
const iconMap = {
  'combined-single-check': [
    { icon: 'tabler-align-right', ratio: 1, translate: '(0,0)' },
    { icon: 'tabler-check', ratio: 0.35, translate: '(-280%, -5%)' }
  ]
}
</script>
<template>
  <div class="combined-icon-wrapper">
    <VIcon 
      v-for="item in iconMap[icon]" 
      :icon="item.icon" :size="size*item.ratio"
      :class="item.icon"
      :style="[
        'transform: translate' + item.translate
      ]"
    />
  </div>
</template>
<style lang="scss">
svg.iconify.tabler-check {
  position: relative;
  z-index: 1;
  & * {
    stroke-width: 6;
  }
}
</style>