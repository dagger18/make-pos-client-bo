export default {
  list(consolId) {
    return $api(`consolidation/${consolId}/stuffing`)
  },
  get(consolId, id) {
    return $api(`consolidation/${consolId}/stuffing/${id}`)
  },
  create(consolId, data) {
    return $api(`consolidation/${consolId}/stuffing`, { method: 'POST', body: JSON.stringify(data) })
  },
  update(consolId, id, data) {
    return $api(`consolidation/${consolId}/stuffing/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(consolId, id) {
    return $api(`consolidation/${consolId}/stuffing/${id}`, { method: 'DELETE' })
  },
}
