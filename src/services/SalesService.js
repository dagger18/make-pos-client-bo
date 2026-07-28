import CommonService from '@/services/CommonService'

export default {
  // ── Orders ────────────────────────────────────────────────────────────────
  listOrders(params = '') {
    return $api(`order?${params}`)
  },
  getOrder(id) {
    return $api(`order/${id}`)
  },
  createOrder(data) {
    return $api('order', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateOrder(data) {
    return $api(`order/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  cancelOrder(id) {
    return $api(`order/${id}`, { method: 'DELETE', loading: true })
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  addPayment(orderId, data) {
    return $api(`order/${orderId}/payment`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  deletePayment(orderId, pid) {
    return $api(`order/${orderId}/payment/${pid}`, { method: 'DELETE', loading: true })
  },
}
