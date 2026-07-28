import { useAuthStore } from '@/stores/authStore'

export function useFeature() {
  const authStore = useAuthStore()

  function featureEnabled(featureId) {
    const config = authStore.featureConfig
    if (!config || !Array.isArray(config)) return false
    return config.includes(featureId)
  }

  return { featureEnabled }
}
