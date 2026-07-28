// portalAuthStore removed - freight-specific portal auth

const BASE = '/portal'

function portalFetch(path, options = {}) {
  const headers = { ...(options.headers ?? {}) }
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
