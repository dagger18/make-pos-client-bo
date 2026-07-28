import { ref } from 'vue'

const visible = ref(false)

export function useUpgradeDialog() {
  function open() { visible.value = true }
  function close() { visible.value = false }
  return { visible, open, close }
}
