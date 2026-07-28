export default {
  list(consolId) {
    return $api(`consolidation/${consolId}/stripping`)
  },
  get(consolId, id) {
    return $api(`consolidation/${consolId}/stripping/${id}`)
  },
  create(consolId, data) {
    return $api(`consolidation/${consolId}/stripping`, { method: 'POST', body: JSON.stringify(data) })
  },
  update(consolId, id, data) {
    return $api(`consolidation/${consolId}/stripping/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(consolId, id) {
    return $api(`consolidation/${consolId}/stripping/${id}`, { method: 'DELETE' })
  },
}
