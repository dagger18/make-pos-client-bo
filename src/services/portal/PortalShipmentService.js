import { portalFetch } from '@/services/portal/PortalAuthService'

export default {
  list(params = '') {
    return portalFetch(`/shipments${params ? '?' + params : ''}`)
  },
  get(id) {
    return portalFetch(`/shipments/${id}`)
  },
}
