<script setup>
definePage({
  meta: {
    public: true,
  },
})

const form = ref(null)
const testModel = {
  "name":"Constantine report",
  "filters":[
    {"property":"quote.shipmentMode","operator":"eq","value":2,"key":"ae72231e-d0fc-46d9-9f34-21a320aee68a"},{"property":"anywhere","operator":"eq","value":null,"key":"f0405d63-c4ca-42ee-8621-f29b10ab6127"}
  ],
  "entityType":"shipment","columns":["code","shipmentMode"]
}
onMounted(() => {
  //form.value.setEntity()
})
const currentPage = ref(null)
const tabs = ref([
  {id: 1, name: 'This is 1', order: 1},
  {id: 2, name: 'This is 2', order: 2},
  {id: 3, name: 'This is 3', order: 3},
])
const [dragging, toggleDragging] = useToggle()
</script>
<template>
<VTabs
  :modelValue="currentPage" 
  class="mt-1"
>
<Draggable
  class="d-flex"
  v-bind="{
      animation: 200,
      group: 'description',
      disabled: false,
      ghostClass: 'ghost',
      direction: 'horizontal'
    }"
  v-model="tabs"
  @start="toggleDragging(true)"
  @end="toggleDragging(false)"
  item-key="order"
>
  <template #item="{element}">
    <v-tab :value="element.id" :key="element.id">
      {{element.name}}
    </v-tab>
  </template>
</Draggable>
</VTabs>
</template>
