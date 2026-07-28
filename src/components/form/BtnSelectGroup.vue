<script setup>
const props = defineProps({
  items: {type: Array, default: () => []},
  valueKey: {type: String, default: 'value'},
  variant: {type: String, default: 'outlined'}
})
</script>
<template>
<VBtnToggle
  v-bind="$attrs"
  divided
  color="primary"
  :variant="variant"
  class="w-100"
  style="max-block-size: 40px;"
  mandatory
>
  <VBtn v-for="item in items" :value="item[valueKey]" >
    <VIcon 
      v-if="item.icon" :icon="item.icon" 
      class="me-2" :size="item.iconSize ?? 14"/>
    <span class="text-body-2" :class="{'text-primary' : $attrs.modelValue === item[valueKey]}">{{ item.title }}</span>
  </VBtn>
</VBtnToggle> 
</template>
