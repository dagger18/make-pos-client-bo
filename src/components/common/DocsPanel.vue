<script setup>
import { useDocsPanel } from '@/composables/useDocsPanel'

const panel = useDocsPanel()
</script>

<template>
  <VNavigationDrawer
    v-model="panel.isOpen.value"
    location="right"
    temporary
    :width="620"
    style="z-index: 2000;"
    class="docs-panel"
  >
    <!-- Header -->
    <div class="d-flex align-center px-3 py-2" style="border-bottom: 1px solid rgba(0,0,0,.08); flex-shrink: 0;">
      <VIcon icon="tabler-help-circle" size="18" class="me-2 text-primary" />
      <span class="text-subtitle-2 font-weight-semibold">User Guide</span>
      <VSpacer />
      <VBtn
        :href="panel.docUrl.value"
        target="_blank"
        icon
        size="x-small"
        variant="text"
        title="Open in new tab"
        class="me-1"
      >
        <VIcon icon="tabler-external-link" size="16" />
      </VBtn>
      <VBtn
        icon
        size="x-small"
        variant="text"
        title="Close"
        @click="panel.close()"
      >
        <VIcon icon="tabler-x" size="16" />
      </VBtn>
    </div>

    <!-- Iframe -->
    <iframe
      :key="panel.docUrl.value"
      :src="panel.docUrl.value"
      style="width: 100%; flex: 1 1 0; border: none; display: block; min-height: 0;"
    />
  </VNavigationDrawer>
</template>

<style>
.docs-panel .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
