<script setup>
import navItems from '@/config/navigation';
import UpgradePlanDialog from '@/components/UpgradePlanDialog.vue';
import ReportNav from '@/components/report/ReportNav.vue';
import LibraryNav from '@/components/library/LibraryNav.vue';
import DocsPanel from '@/components/common/DocsPanel.vue';
import DocsFab from '@/components/common/DocsFab.vue';

// Components

// @layouts plugin
import { VerticalNavLayout } from '@layouts';
import { useRoute } from 'vue-router';
const route = useRoute()
// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
</script>

<template>
  <VerticalNavLayout :nav-items="navItems()">
    <template #default="{toggleVerticalOverlayNavActive}">
      <AppLoadingIndicator ref="refLoadingIndicator" />
      <UpgradePlanDialog />
      <DocsPanel />
      <DocsFab />

      <ReportNav
        v-if="route.path.startsWith('/report')"
        :toggleVerticalOverlayNavActive="toggleVerticalOverlayNavActive"
      />
      <LibraryNav
        v-if="route.path.startsWith('/library')"
        :toggleVerticalOverlayNavActive="toggleVerticalOverlayNavActive"
      />

      <!-- 👉 Pages -->
      <RouterView v-slot="{ Component }" :key="route.fullPath">
        <Suspense
          :timeout="0"
          @fallback="isFallbackStateActive = true"
          @resolve="isFallbackStateActive = false"
        >
          <Component :is="Component" :toggleVerticalOverlayNavActive="toggleVerticalOverlayNavActive" />
        </Suspense>
      </RouterView>
    </template>
  </VerticalNavLayout>
</template>
