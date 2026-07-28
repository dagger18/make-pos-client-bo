import { portalFetch } from '@/services/portal/PortalAuthService'

export default {
  list() {
    return portalFetch('/invoices')
  },
}
