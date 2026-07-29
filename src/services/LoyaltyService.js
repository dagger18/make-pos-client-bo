import CommonService from '@/services/CommonService'

export default {
  listCustomers(params = '') {
    return $api(`loyalty/customer?${params}`)
  },
  getCustomer(id) {
    return $api(`loyalty/customer/${id}`)
  },
  createCustomer(data) {
    return $api('loyalty/customer', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateCustomer(data) {
    return $api(`loyalty/customer/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  earn(id, data) {
    return $api(`loyalty/customer/${id}/earn`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  redeem(id, data) {
    return $api(`loyalty/customer/${id}/redeem`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
}
