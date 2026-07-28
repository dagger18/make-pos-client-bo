<script setup>
import { enums as ChargeType, findByValue } from '@/config/enums/ChargeType';
import RateTable from '@/views/rate/RateTable.vue';
definePage({ 
  meta: { action: 'MANAGE_Service', subject: 'Rate' },
})
</script>
<template>
  <RateTable
    :currentChargeType="findByValue(ChargeType.Service)"
  />
</template>
