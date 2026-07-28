import { ref } from 'vue'

const _buttons = ref([])

export function useLibraryHeader() {
  return { buttons: _buttons }
}
