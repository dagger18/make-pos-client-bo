<script setup>
import { enums as ChargeType, findByValue } from '@/config/enums/ChargeType';
import RateTable from '@/views/rate/RateTable.vue';
definePage({ 
  meta: { action: 'MANAGE_Local', subject: 'Rate' },
})
</script>
<template>
  <RateTable
  :currentChargeType="findByValue(ChargeType.Local)"
  />
</template>
