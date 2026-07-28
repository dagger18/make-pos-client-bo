const BASE = 'my-profile'

export default {
  getNotifications(page) {
    return $api(`${BASE}/get-notifications/${page}`)
  },
  markRead(ids = null) {
    return $api(`${BASE}/mark-notifications-read`, {
      method: 'POST',
      body: ids ? { ids } : {},
    })
  },
}
