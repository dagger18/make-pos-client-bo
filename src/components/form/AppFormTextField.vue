<script setup>
defineProps({
  appendInner: { default: null },
  prependInner: { default: null },
})
</script>
<template>
  <AppTextField
    outlined density="compact"
    :class="{ 'ps-0': !!prependInner }"
  >
    <template v-if="appendInner" #append-inner>{{ appendInner }}</template>
    <template v-if="prependInner" #prepend-inner>
      <v-chip
        style="block-size: 100%"
        label
        class="rounded-ts-sm rounded-bs-sm rounded-te-0 rounded-be-0"
        variant="outlined"
      >{{ prependInner }}</v-chip>
    </template>
  </AppTextField>
</template>
