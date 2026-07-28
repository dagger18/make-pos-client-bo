<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant';
import miscMaskDark from '@images/pages/misc-mask-dark.png';
import miscMaskLight from '@images/pages/misc-mask-light.png';
import miscUnderMaintenance from '@images/pages/misc-under-maintenance.png';

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

</script>

<template>
  <div class="misc-wrapper">
    <div class="text-center mb-0 mt-12">
      <!-- 👉 Title and subtitle -->
      <h4 class="text-h4 font-weight-medium mb-3">
        Work in progress! 🚧
      </h4>
      <p>Sorry for the inconvenience but this page is not finished. We're working on another thing at the moment</p>

      <VBtn to="/">
        Back to Home
      </VBtn>
    </div>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center mt-12">
      <VImg
        :src="miscUnderMaintenance"
        alt="Coming Soon"
        :max-width="350"
        class="mx-auto"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
