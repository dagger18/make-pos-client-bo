const BASE = (shipmentId) => `shipment/${shipmentId}/parties`

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
  update(shipmentId, role, payload) {
    return $api(`${BASE(shipmentId)}/${role}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, role) {
    return $api(`${BASE(shipmentId)}/${role}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
