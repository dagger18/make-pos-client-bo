const BASE = (shipmentId) => `shipment/${shipmentId}/rail-booking`

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
  update(shipmentId, rbId, payload) {
    return $api(`${BASE(shipmentId)}/${rbId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, rbId) {
    return $api(`${BASE(shipmentId)}/${rbId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
