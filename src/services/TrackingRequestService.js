const BASE_URI = (shipmentId) => `shipment/${shipmentId}/tracking-requests`

export default {
  listAll(params = '') { return $api(`tracking-requests?${params}`) },
  list(shipmentId) {
    return $api(BASE_URI(shipmentId))
  },
  add(shipmentId, payload) {
    return $api(BASE_URI(shipmentId), { method: 'POST', body: payload, loading: true })
  },
  pause(shipmentId, id) {
    return $api(`${BASE_URI(shipmentId)}/${id}/pause`, { method: 'PATCH', loading: true })
  },
  resume(shipmentId, id) {
    return $api(`${BASE_URI(shipmentId)}/${id}/resume`, { method: 'PATCH', loading: true })
  },
  delete(shipmentId, id) {
    return $api(`${BASE_URI(shipmentId)}/${id}`, { method: 'DELETE', loading: true })
  },
  events(shipmentId, id) {
    return $api(`${BASE_URI(shipmentId)}/${id}/events`)
  },
}
