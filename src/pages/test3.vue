<script setup>
import PriceDetails from '@/components/form/PriceDetails.vue';
import CommonService from '@/services/CommonService';

definePage({
  meta: {
    public: true,
  },
})
const { required } = CommonService.rules()
const model = ref([])
const quote = {"transportType":"AIR","provider":{"name":"CSL/CORDELIA CONTAINER SHIPPING LINE","code":"DDMKYR0068","phone":"","city":"","country":null,"trackingUrl":"","creditPeriod":0,"defaultContact":{"id":15,"firstName":"","lastName":"","phone":""},"createdBy":{"id":4,"email":"minh.vu@pyramidlogisticsvn.com","status":"A","firstName":"Minh","lastName":"Vũ","phone":"0888339377","title":"Chief Accountant","userGroup":{"id":1,"name":"Admin","description":null,"members":3},"logo":{"path":"http://local.maca.com/v1/uploads/media/c1/f2/70374cd8fe7e8965b2f3d8b62872.jpg"},"lastPing":"2024-04-22T03:01:04+00:00","smtpPassword":"*********","assignedClients":91},"createdDate":"2023-02-28T07:44:44+00:00","id":15},"cargoVolume":null,"exchangeRates":{},"originPort":{"id":82,"name":"Camp Bastion","code":"CBN","codeFull":"AFCBN","subdiv":"Helmand","displayName":"Camp Bastion, Helmand (CBN)"},"destinationPort":{"id":82,"name":"Camp Bastion","code":"CBN","codeFull":"AFCBN","subdiv":"Helmand","displayName":"Camp Bastion, Helmand (CBN)"}}
</script>
<template>
 <PriceDetails
   :modelValue="model"
   :quote="quote"></PriceDetails>

</template>
