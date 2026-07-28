<script setup>
import { enums as PageType } from '@/config/enums/PageType';
import ReportView from '../../views/report/ReportView.vue';
definePage({ 
  meta: { action: 'GET', subject: 'Report' },
})

</script>
<template>
<ReportView 
  :reportType="PageType.ReportCharge"
/>
</template>
