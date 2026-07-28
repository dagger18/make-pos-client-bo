<script setup>
defineProps({
  buttonText: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  click: { type: Function, default: null },
})
</script>
<template>
  <VBtn :color="isPrimary ? 'primary' : null" dark depressed small class="ml-0" @click="click">
    {{ buttonText }}
  </VBtn>
</template>
