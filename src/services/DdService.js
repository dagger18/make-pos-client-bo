export default {
  // Free-Time Agreements
  list(params) {
    return $api(`free-time-agreement${params ? `?${params}` : ''}`)
  },
  listFta(carrierId = null) {
    const q = carrierId ? `?carrierId=${carrierId}` : ''
    return $api(`free-time-agreement${q}`)
  },
  getFta(id) {
    return $api(`free-time-agreement/${id}`)
  },
  createFta(data) {
    return $api('free-time-agreement', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  updateFta(id, data) {
    return $api(`free-time-agreement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  deleteFta(id) {
    return $api(`free-time-agreement/${id}`, { method: 'DELETE' })
  },

  // Container D&D Tracking
  listByShipment(shipmentId) {
    return $api(`dd/shipment/${shipmentId}`)
  },
  create(shipmentId, data) {
    return $api(`dd/shipment/${shipmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  update(id, data) {
    return $api(`dd/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  recordReturn(id, returnDate) {
    return $api(`dd/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ returnDate }),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  dispute(id, reason) {
    return $api(`dd/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  deleteTracking(id) {
    return $api(`dd/${id}`, { method: 'DELETE' })
  },
  dashboard() {
    return $api('dd/dashboard')
  },
}
