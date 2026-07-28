const BASE = (shipmentId) => `shipment/${shipmentId}/documents2`

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
  update(shipmentId, docId, payload) {
    return $api(`${BASE(shipmentId)}/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, docId) {
    return $api(`${BASE(shipmentId)}/${docId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
