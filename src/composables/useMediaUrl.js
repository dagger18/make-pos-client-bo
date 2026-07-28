import { baseApiUrl } from '@/utils/api'

export function useMediaUrl() {
  function getThumbnailUrl(mediaPath) {
    if (!mediaPath) return null
    const appBase = baseApiUrl.replace(/\/api$/, '')
    return `${appBase}/media/cache/resolve/thumbnail/${mediaPath}`
  }

  async function getDownloadUrl(mediaId) {
    if (!mediaId) return null
    try {
      const { token } = await $api(`media/${mediaId}/download-url`)
      return `${baseApiUrl}/public/media/serve/${token}`
    } catch {
      return null
    }
  }

  return { getThumbnailUrl, getDownloadUrl }
}
