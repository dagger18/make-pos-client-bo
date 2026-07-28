const BASE = 'warehouse-facility'

export default {
  list() {
    return $api(BASE)
  },
  get(id) {
    return $api(`${BASE}/${id}`)
  },
  create(data) {
    return $api(BASE, { method: 'POST', body: JSON.stringify(data) })
  },
  update(id, data) {
    return $api(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(id) {
    return $api(`${BASE}/${id}`, { method: 'DELETE' })
  },
  inventory(id) {
    return $api(`${BASE}/${id}/inventory`)
  },
}
