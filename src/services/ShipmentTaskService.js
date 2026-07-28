const BASE = (shipmentId) => `shipment/${shipmentId}/tasks`

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
  update(shipmentId, taskId, payload) {
    return $api(`${BASE(shipmentId)}/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, taskId) {
    return $api(`${BASE(shipmentId)}/${taskId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
  complete(shipmentId, taskId) {
    return $api(`${BASE(shipmentId)}/${taskId}/complete`, {
      method: 'POST',
      loading: true,
    })
  },
  reopen(shipmentId, taskId) {
    return $api(`${BASE(shipmentId)}/${taskId}/reopen`, {
      method: 'POST',
      loading: true,
    })
  },
}
