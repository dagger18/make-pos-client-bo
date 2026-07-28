<script setup>
import AppAutocomplete from '@/@core/components/app-form-elements/AppAutocomplete.vue'

defineProps({
  itemSlot: { type: Function, default: null },
})
</script>
<template>
  <AppAutocomplete
    density="compact"
    clear-icon="tabler-x"
    style="min-inline-size:57px"
  >
    <template v-if="itemSlot" #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="itemSlot(item)" />
    </template>
  </AppAutocomplete>
</template>
