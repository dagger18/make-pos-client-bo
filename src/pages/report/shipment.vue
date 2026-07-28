<script setup>
import { enums as PageType } from '@/config/enums/PageType';
import ReportView from '../../views/report/ReportView.vue';
definePage({ 
  meta: { action: 'GET', subject: 'Report', navActiveLink: 'report-dataset' },
})

</script>
<template>
<ReportView 
  :reportType="PageType.ReportShipment"
/>
</template>
