const BASE = (shipmentId) => `shipment/${shipmentId}/parcel`

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
  update(shipmentId, parcelId, payload) {
    return $api(`${BASE(shipmentId)}/${parcelId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, parcelId) {
    return $api(`${BASE(shipmentId)}/${parcelId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
