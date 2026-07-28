const BASE = (shipmentId) => `shipment/${shipmentId}/truck`

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
  update(shipmentId, truckId, payload) {
    return $api(`${BASE(shipmentId)}/${truckId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, truckId) {
    return $api(`${BASE(shipmentId)}/${truckId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
