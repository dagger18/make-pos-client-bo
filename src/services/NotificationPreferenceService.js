const BASE = 'my-profile'

export default {
  getPreferences() {
    return $api(`${BASE}/notification-preferences`)
  },
  savePreferences(preferences) {
    return $api(`${BASE}/notification-preferences`, {
      method: 'POST',
      body: preferences,
    })
  },
}
