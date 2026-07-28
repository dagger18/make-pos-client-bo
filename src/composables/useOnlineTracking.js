import { useLocalStorage } from '@vueuse/core'

const disableOnlineTracking = useLocalStorage('makecargo:disableOnlineTracking', false)

export function useOnlineTracking() {
  return { disableOnlineTracking }
}
