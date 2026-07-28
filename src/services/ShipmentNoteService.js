const BASE = (shipmentId) => `shipment/${shipmentId}/notes`

export default {
  list(shipmentId) {
    return $api(BASE(shipmentId))
  },
  create(shipmentId, payload) {
    return $api(BASE(shipmentId), {
      method: 'POST',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  update(shipmentId, noteId, payload) {
    return $api(`${BASE(shipmentId)}/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, noteId) {
    return $api(`${BASE(shipmentId)}/${noteId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
