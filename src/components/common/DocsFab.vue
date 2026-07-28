<script setup>
import { useDocsPanel } from '@/composables/useDocsPanel'
import { useDocsFab } from '@/composables/useDocsFab'
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()
const docsPanel = useDocsPanel()
const { showDocsFab } = useDocsFab()
</script>

<template>
  <Transition name="docs-fab">
    <VBtn
      v-if="showDocsFab"
      icon
      size="40"
      color="primary"
      elevation="4"
      class="docs-fab"
      @click="docsPanel.toggle()"
    >
      <VIcon icon="tabler-book-2" size="20" />
      <VTooltip activator="parent" location="start">
        {{ $gettext('Toggle User Guide (turn off in Profile)') }}
      </VTooltip>
    </VBtn>
  </Transition>
</template>

<style scoped>
.docs-fab {
  position: fixed;
  inset-block-end: 12px;
  inset-inline-end: 12px;
  z-index: 1000;
}

.docs-fab-enter-active,
.docs-fab-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.docs-fab-enter-from,
.docs-fab-leave-to {
  transform: scale(0.5);
  opacity: 0;
}
</style>
