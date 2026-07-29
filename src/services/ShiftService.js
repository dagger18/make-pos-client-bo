import CommonService from '@/services/CommonService'

export default {
  listShifts(params = '') {
    return $api(`shift?${params}`)
  },
  getShift(id) {
    return $api(`shift/${id}`)
  },
  openShift(data) {
    return $api('shift', { method: 'POST', body: CommonService.formData(data), loading: true })
  },
  closeShift(id, data) {
    return $api(`shift/${id}/close`, { method: 'POST', body: CommonService.formData(data), loading: true })
  },
}
