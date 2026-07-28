<script setup>
const props = defineProps({
  modelValue: {},
  items: { type: Array, default: () => [] },
  columnCount: { type: Number, default: 3 }
})
const rows = computed(() => {
  const rows = [[]]
  props.items.forEach((item, index) => {
    rows[rows.length - 1].push(item)
    if(index%props.columnCount === props.columnCount - 1) {
      rows.push([])
    }
  })
  return rows
})
const active = ref(null)
onMounted(() => {
  active.value = props.modelValue
})
</script>
<template>
  <VRadioGroup 
    v-model="active"
    @update:modelValue="$emit('update:modelValue', $event)"
    inline class="app-radio-group w-100"
  >
    <template v-for="row in rows">
      <v-row v-if="row.length">
        <v-col 
          cols="12"
          :md="12/props.columnCount" 
          :sm="24/props.columnCount" 
          :xs="36/props.columnCount" 
          v-for="item in row" 
        >
          <v-hover
            v-slot="{ isHovering, props }"
          >
            <VCard v-bind="props" class="h-100 elevation-0 rounded-0" >
              <VRadio 
                :value="item.value"
                :key="item.value"
                :disabled="item.disabled"
                class="w-100 h-100"
                :class="{ 'active': isHovering }"
              >
                <template #label>
                  <div class="d-flex align-center justify-between flex-column text-center h-100">
                    <component 
                      :is="item.icon.startsWith('combined') ? 'combined-icons' : 'v-icon'"
                      :icon="item.icon" :size="28" class="my-3"
                      :color="isHovering ? 'primary' : ''"
                    />
                    <div>{{ item.title }}</div>
                    <div class="text-disabled text-caption">{{ item.description }}</div>
                  </div>
                </template>
              </VRadio>
            </VCard>
          </v-hover>
        </v-col>
      </v-row>
    </template>
  </VRadioGroup>
</template>
<script>
// :))
import { defineComponent } from 'vue'
import CombinedIcons from '@/components/common/CombinedIcons.vue'
import { VIcon } from 'vuetify/components/VIcon'
export default defineComponent({
  components: {
    CombinedIcons,
    VIcon
  },
});
</script>
