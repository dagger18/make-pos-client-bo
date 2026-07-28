import { usePortalAuthStore } from '@/stores/portalAuthStore'

const BASE = '/portal'

function portalFetch(path, options = {}) {
  const store = usePortalAuthStore()
  const headers = { ...(options.headers ?? {}) }
  if (store.accessToken && store.user?.email) {
    headers['X-W-Auth'] = `Token Email="${store.user.email}", Token="${store.accessToken}"`
  }
  return $api(`${BASE}${path}`, { ...options, headers })
}

export default {
  login(email, password) {
    return $api(`${BASE}/auth`, { method: 'POST', body: { email, password } })
  },
  logout() {
    return portalFetch('/logout', { method: 'POST' })
  },
  me() {
    return portalFetch('/me')
  },
}

export { portalFetch }
