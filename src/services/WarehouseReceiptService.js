export default {
  list(shipmentId) {
    return $api(`shipment/${shipmentId}/warehouse-receipt`)
  },
  create(shipmentId, data) {
    return $api(`shipment/${shipmentId}/warehouse-receipt`, { method: 'POST', body: JSON.stringify(data) })
  },
  update(shipmentId, receiptId, data) {
    return $api(`shipment/${shipmentId}/warehouse-receipt/${receiptId}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(shipmentId, receiptId) {
    return $api(`shipment/${shipmentId}/warehouse-receipt/${receiptId}`, { method: 'DELETE' })
  },
}
