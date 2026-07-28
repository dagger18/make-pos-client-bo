<script setup>
import QuoteForm from '@/views/quote/QuoteForm.vue';

definePage({
  meta: {
    //layout: 'blank',
    public: true,
  },
})
const form = ref(null)

onMounted(() => {
  form.value.setEntity({
    provider: {id: 10, name: 'APEX/CÔNG TY TNHH TIẾP VẬN QUỐC TẾ APEX (VIỆT NAM)'}, 
    client: {id: 14, name: 'INANI/CÔNG TY TNHH ĐÁ HOA INANI'}, 
    originPort: {"id":74,"name":"Umm al Quwain","code":"QIW","codeFull":"AEQIW","subdiv":"United Arab Emirates","displayName":"Umm al Quwain, United Arab Emirates (QIW)"}, 
    originDoor: 'Umm al Quwain, United Arab Emirates (QIW)',
    destinationPort: {"id":116,"name":"Nimroz","code":"IMZ","codeFull":"AFIMZ","subdiv":"Afghanistan","displayName":"Nimroz, Afghanistan (IMZ)"},
    destinationDoor: 'Nimroz, Afghanistan (IMZ)',
    transportType: 'AIR',
    shipmentMode: {
      id: 1, name: 'Handling'
    }
  })
})

</script>
<template>
<QuoteForm
  ref="form" 
/>
</template>
