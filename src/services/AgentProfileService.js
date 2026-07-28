export default {
  get(providerId) { return $api(`agent-profile/${providerId}`) },
  save(providerId, data) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
    return $api(`agent-profile/${providerId}`, { method: 'PUT', body: fd, loading: true })
  }
}
