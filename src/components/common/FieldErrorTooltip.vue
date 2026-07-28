<script setup>
import { useDisplay } from 'vuetify'

defineProps({
  message: { type: String, default: null },
})

const { mobile } = useDisplay()
</script>

<template>
  <VTooltip
    v-if="message"
    :text="message"
    location="top end"
    :offset="[12, 12]"
    :open-on-hover="true"
    :open-on-click="mobile"
    :open-on-focus="false"
    content-class="field-error-tooltip"
    :content-props="{ style: 'pointer-events: none' }"
  >
    <template #activator="{ props: tp }">
      <VIcon
        v-bind="tp"
        icon="tabler-alert-triangle-filled"
        color="error"
        size="18"
        style="cursor: help; flex-shrink: 0;"
      />
    </template>
  </VTooltip>
</template>

<style>
.field-error-tooltip {
  overflow: visible !important;
  font-size: 13px !important;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    right: 14px;
    width: 10px;
    height: 10px;
    background: inherit;
    transform: rotate(45deg);
  }
}
</style>
