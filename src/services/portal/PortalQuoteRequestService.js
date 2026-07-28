import { portalFetch } from '@/services/portal/PortalAuthService'

export default {
  list() {
    return portalFetch('/quote-requests')
  },
  get(id) {
    return portalFetch(`/quote-requests/${id}`)
  },
  submit(payload) {
    return portalFetch('/quote-requests', { method: 'POST', body: payload })
  },
}
