<script setup>
import ConsolidationDetail from '@/views/consolidation/ConsolidationDetail.vue'
definePage({
  meta: { action: 'GET', subject: 'Consolidation', navActiveLink: 'consolidation' },
})
</script>

<template>
  <ConsolidationDetail />
</template>
