const BASE = (shipmentId) => `shipment/${shipmentId}/legs`

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
  delete(shipmentId, legId) {
    return $api(`${BASE(shipmentId)}/${legId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
