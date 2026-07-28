import { ref, watchEffect } from 'vue'

export function useFieldTooltipError() {
  const fieldRef = ref(null)
  const errorMessage = ref(null)

  watchEffect(() => {
    const field = fieldRef.value
    if (!field) {
      errorMessage.value = null
      return
    }

    // isValid is null when never validated, true when valid, false when invalid.
    // Only show error icon after explicit validation (isValid === false).
    const isValidRaw = field.isValid
    const isValid = isValidRaw && typeof isValidRaw === 'object' && 'value' in isValidRaw
      ? isValidRaw.value
      : isValidRaw
    if (isValid !== false) {
      errorMessage.value = null
      return
    }

    const msgs = field.errorMessages
    if (!msgs) {
      errorMessage.value = null
      return
    }
    const arr = Array.isArray(msgs) ? msgs : (msgs.value ?? [])
    errorMessage.value = arr[0] ?? null
  })

  return { fieldRef, errorMessage }
}
