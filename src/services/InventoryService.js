import CommonService from '@/services/CommonService'

export default {
  listStock(params = '') {
    return $api(`inventory?${params}`)
  },
  getStock(id) {
    return $api(`inventory/${id}`)
  },
  addProduct(data) {
    return $api('inventory', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  adjust(id, data) {
    return $api(`inventory/${id}/adjust`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
}
