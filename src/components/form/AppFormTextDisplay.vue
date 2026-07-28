<script setup>
defineProps({
  renderText: { default: '' },
  bodyClass: { default: null },
  modelValue: { default: null },
})
</script>
<template>
  <div class="h-100 d-flex align-center" :class="bodyClass" v-html="renderText" />
</template>
