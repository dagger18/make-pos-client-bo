export default {
  get(providerId) { return $api(`carrier-profile/${providerId}`) },
  save(providerId, data) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
    return $api(`carrier-profile/${providerId}`, { method: 'PUT', body: fd, loading: true })
  }
}
