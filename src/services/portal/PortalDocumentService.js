import { portalFetch } from '@/services/portal/PortalAuthService'

export default {
  list() {
    return portalFetch('/documents')
  },
  getDownloadUrl(id) {
    return portalFetch(`/documents/${id}/download-url`)
  },
}
