const BASE_URI = 'vessel-roll'

export default {
  list(shipmentId) {
    return $api(`${BASE_URI}?shipmentId=${shipmentId}`)
  },
  create(entity) {
    return $api(BASE_URI, {
      method: 'POST',
      body: JSON.stringify(entity),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  markNotified(id) {
    return $api(`${BASE_URI}/${id}/notify`, { method: 'PUT' })
  },
}
