<script setup>
import { getAccountingMenuList } from '@/config/enums/EbitNoteType';
import { useAuthStore } from '@/stores/authStore';
const { userAbilityRules } = useAuthStore()
</script>
<template>
<VTabs class="v-tabs-pill">
  <v-tab
    v-for="tab in getAccountingMenuList.filter(
      ct => userAbilityRules.some(
          ability => (
            ability.action === ('MANAGE_' + (ct.value.startsWith('SOA') ? 'SOA' : ct.value))
            && ability.subject === 'EbitNote'
          ) || (ability.action === 'manage' && ability.subject === 'all')
        )
    )"
    :value="tab.value"
    @click="$router.push({ 
      path: '/accounting/' + tab.value
    })">
    {{ tab.title }}
  </v-tab>
</VTabs>
</template>
