<script setup>
import { useToggle } from "@vueuse/core";
import { watch } from "vue";
const props = defineProps({
  modelValue: {type: Array, default: () => []},
  showSelectAll: {type: Boolean, default: false},
})
const [dragging, toggleDragging] = useToggle()
const attrs = useAttrs()
const emit = defineEmits(['update:modelValue'])
function showItemTitle(element) {
  const itemConfig = attrs.items.find(item => item.value === element)
  if(itemConfig) return itemConfig.title
  return $gettext('Unknown item, please remove')
}
function removeItem(element) {
  const elementIndex = props.modelValue.findIndex(item => item === element)
  if(elementIndex === -1) return
  props.modelValue.splice(elementIndex,1)
  emit('update:modelValue', props.modelValue)
}
const [selectAll, toggleSelectAll] = useToggle()
watch(() => selectAll.value, (value) => {
  if(value) {
    emit('update:modelValue', attrs.items.map(item => item.value))
  } else {
    emit('update:modelValue', [])
  }
})
</script>
<template>
  <v-autocomplete
    v-bind="attrs"
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    multiple
  >
  <template #prepend-item v-if="showSelectAll">
    <v-list-item>
      <template v-slot:prepend>
        <v-list-item-action>
          <v-checkbox-btn :model-value="selectAll" @click="toggleSelectAll()"></v-checkbox-btn>
        </v-list-item-action>
      </template>
      <v-list-item-title>Select all</v-list-item-title>
    </v-list-item>
  </template>
  <template #selection="{item, index}">
    <span v-if="index === 0">
      {{ modelValue.length }} {{ $gettext('item(s) selected') }}
    </span>
  </template>
  </v-autocomplete>
  <div class="dragger pt-2">
  <Draggable
    class="list-group"
    tag="transition-group"
    :component-data="{
      tag: 'div',
      type: 'transition-group',
      name: !dragging ? 'flip-list' : null
    }"
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    v-bind="{
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }"
    @start="toggleDragging(true)"
    @end="toggleDragging(false)"
    item-key="order"
  >
    <template #item="{ element }">
      <div class="list-group-item pt-1" :key="element">
        <VIcon icon="tabler-menu-2" size="13"></VIcon>
        {{ showItemTitle(element) }}
        <VIcon icon="tabler-x" size="13" color="error" @click="removeItem(element)" class="cursor-pointer"></VIcon>
      </div>
    </template>
  </Draggable>
  </div>
</template>
<style lang="scss">
.dragger {
  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    background: #c8ebfb;
    opacity: 0.5;
  }

  .list-group {
    min-block-size: 20px;
  }

  .list-group-item {
    cursor: move;
  }
}

</style>
