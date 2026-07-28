const BASE = (shipmentId) => `shipment/${shipmentId}/milestones`

export default {
  list(shipmentId) {
    return $api(BASE(shipmentId))
  },
  upsert(shipmentId, payload) {
    return $api(BASE(shipmentId), {
      method: 'POST',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  update(shipmentId, milestoneId, payload) {
    return $api(`${BASE(shipmentId)}/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, milestoneId) {
    return $api(`${BASE(shipmentId)}/${milestoneId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
}
