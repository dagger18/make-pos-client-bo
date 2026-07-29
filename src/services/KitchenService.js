import CommonService from '@/services/CommonService'

export default {
  listTickets(params = '') {
    return $api(`kitchen?${params}`)
  },
  getTicket(id) {
    return $api(`kitchen/${id}`)
  },
  createFromOrder(orderId) {
    return $api(`kitchen/from-order/${orderId}`, { method: 'POST', loading: true })
  },
  advance(id) {
    return $api(`kitchen/${id}/advance`, { method: 'POST', loading: true })
  },
}
