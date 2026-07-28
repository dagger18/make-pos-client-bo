import { useLocalStorage } from '@vueuse/core'

// Shared singleton — all callers get the same reactive ref
const showDocsFab = useLocalStorage('makecargo:showDocsFab', true)

export function useDocsFab() {
  return { showDocsFab }
}
