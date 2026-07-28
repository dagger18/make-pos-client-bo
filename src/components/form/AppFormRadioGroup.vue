<script setup>
import FieldErrorTooltip from '@/components/common/FieldErrorTooltip.vue'

defineOptions({ inheritAttrs: false })

defineProps({
  items: { type: Array, default: () => [] },
  itemTitle: { type: String, default: 'title' },
  itemValue: { type: String, default: 'value' },
  inline: { type: Boolean, default: false },
})

const attrs = useAttrs()
const fieldRef = ref(null)
const errorMessage = ref(null)

let _observer = null

function checkError() {
  const el = fieldRef.value?.$el
  if (!el || !el.classList.contains('v-input--error')) {
    errorMessage.value = null
    return
  }
  for (const rule of (attrs.rules ?? [])) {
    const result = rule(attrs.modelValue)
    if (result !== true) {
      errorMessage.value = typeof result === 'string' ? result : 'Field is required'
      return
    }
  }
  errorMessage.value = null
}

watch(fieldRef, field => {
  _observer?.disconnect()
  _observer = null
  if (!field?.$el) return
  checkError()
  _observer = new MutationObserver(checkError)
  _observer.observe(field.$el, { attributes: true, attributeFilter: ['class'] })
}, { immediate: true })

onUnmounted(() => { _observer?.disconnect() })
</script>
<template>
  <VRadioGroup
    ref="fieldRef"
    v-bind="{ validateOn: 'input', ...$attrs, 'hide-details': true }"
  >
    <VRadio
      v-for="radio in items"
      :key="radio[itemValue]"
      :class="[inline ? 'me-4' : 'me-0']"
      :ripple="false"
      :label="radio[itemTitle]"
      :value="radio[itemValue]"
    />
    <template #append>
      <FieldErrorTooltip :message="errorMessage" />
    </template>
  </VRadioGroup>
</template>
