import CommonService from '@/services/CommonService'

export default {
  listTables(params = '') {
    return $api(`table?${params}`)
  },
  getTable(id) {
    return $api(`table/${id}`)
  },
  createTable(data) {
    return $api('table', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  updateTable(data) {
    return $api(`table/${data.id}`, { method: 'PUT', body: CommonService.formData(data), loading: true })
  },
  deleteTable(id) {
    return $api(`table/${id}`, { method: 'DELETE', loading: true })
  },
  setStatus(id, data) {
    return $api(`table/${id}/status`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
}
