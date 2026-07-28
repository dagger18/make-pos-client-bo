<script setup>
import { useFieldTooltipError } from '@/composables/useFieldTooltipError'
import FieldErrorTooltip from '@/components/common/FieldErrorTooltip.vue'

defineOptions({
  name: 'AppCombobox',
  inheritAttrs: false,
})

const elementId = computed(() => {
  const attrs = useAttrs()
  const _elementIdToken = attrs.id || attrs.label

  return _elementIdToken ? `app-combobox-${ _elementIdToken }-${ Math.random().toString(36).slice(2, 7) }` : undefined
})

const label = computed(() => useAttrs().label)
const slots = useSlots()
const filteredSlots = computed(() => Object.fromEntries(Object.entries(slots).filter(([n]) => n !== 'append-inner')))

const { fieldRef, errorMessage } = useFieldTooltipError()
</script>

<template>
  <div
    class="app-combobox flex-grow-1"
    :class="$attrs.class"
  >
    <VLabel
      v-if="label"
      :for="elementId"
      class="mb-1 text-body-2 text-high-emphasis"
      :text="label"
    />
    <VCombobox
      ref="fieldRef"
      v-bind="{
        validateOn: 'blur',
        ...$attrs,
        class: null,
        label: undefined,
        variant: 'outlined',
        id: elementId,
        'hide-details': true,
        'menu-icon': errorMessage ? '' : undefined,
        menuProps: {
          contentClass: [
            'app-inner-list',
            'app-combobox__content',
            'v-combobox__content',
            $attrs.multiple !== undefined ? 'v-list-select-multiple' : '',
          ],
        },
      }"
    >
      <template
        v-for="(_, name) in filteredSlots"
        #[name]="slotProps"
      >
        <slot
          :name="name"
          v-bind="slotProps || {}"
        />
      </template>
      <template #append-inner>
        <FieldErrorTooltip :message="errorMessage" />
        <slot name="append-inner" />
      </template>
    </VCombobox>
  </div>
</template>
