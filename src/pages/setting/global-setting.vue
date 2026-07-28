<script setup>
import ExchangeRateGroup from '@/views/setting/ExchangeRateGroup.vue';
import QuoteCodeFormat from '@/views/setting/QuoteCodeFormat.vue';
import ShipmentIdFormat from '@/views/setting/ShipmentIdFormat.vue';
import { useAttrs } from 'vue';
definePage({
  meta: { action: 'MANAGE', subject: 'Config' },
})
const attrs = useAttrs()
</script>
<template>
  <div>
<VCard
  class="form-title" density="compact"
>
<template #title>
  <IconBtn
    id="vertical-nav-toggle-btn"
    class="d-lg-none"
    @click="attrs.toggleVerticalOverlayNavActive(true)"
  >
    <VIcon
      size="26"
      icon="tabler-menu-2"
    />
  </IconBtn>
  {{ $gettext('Global Setting') }}
</template>
</VCard>
<v-row class="pt-4">
  <v-col cols="12" :lg="5">
    <ExchangeRateGroup />
  </v-col>
  <v-col cols="12" :lg="7">
    <QuoteCodeFormat class="mb-4" />
    <ShipmentIdFormat />
  </v-col>
</v-row>
</div>
</template>
